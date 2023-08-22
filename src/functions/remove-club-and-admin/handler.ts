import { AdminDeleteUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { DeleteItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { fromEnv } from "@aws-sdk/credential-providers";
import { marshall } from "@aws-sdk/util-dynamodb";
import { cachedCognitoIdpClient } from "@libs/cognito";
import { getLogCompletionDecorator } from "@libs/logCompletionDecorator";
import { logFn } from "@libs/logging";
import requiredEnvVar from "@libs/requiredEnvVar";
import { AppSyncResolverEvent } from "aws-lambda";
import { AppSyncResolverHandler } from "aws-lambda/trigger/appsync-resolver";

import {
  MutationRemoveClubAndAdminArgs,
  RemoveClubAndAdminResponse,
} from "../../../appsync";

const catPrefix = "src.functions.remove-club-and-admin.handler.";
const lcd = getLogCompletionDecorator(catPrefix, "debug");
const log = logFn(catPrefix);
let dynamoDbClient: DynamoDBClient;

function cachedDdbClient() {
  if (dynamoDbClient) {
    return dynamoDbClient;
  }
  dynamoDbClient = new DynamoDBClient({
    region: requiredEnvVar("AWS_REGION"),
    credentials: fromEnv(),
  });
  return dynamoDbClient;
}

export async function cognitoDestroyUser(userId: string) {
  return cachedCognitoIdpClient().send(
    new AdminDeleteUserCommand({
      UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
      Username: userId,
    }),
  );
}

export function deleteItemFromTable(tableName: string, userId: string) {
  return cachedDdbClient().send(
    new DeleteItemCommand({
      TableName: tableName,
      Key: marshall({ id: userId }),
    }),
  );
}

export const main: AppSyncResolverHandler<
  MutationRemoveClubAndAdminArgs,
  RemoveClubAndAdminResponse
> = async (
  event: AppSyncResolverEvent<MutationRemoveClubAndAdminArgs>,
): Promise<RemoveClubAndAdminResponse> => {
  const { clubId } = event.arguments.input;
  const promises: Promise<unknown>[] = [];
  promises.push(
    lcd(
      cognitoDestroyUser(event.arguments.input.userId),
      "cognitoDestroyUser",
      { userId: event.arguments.input.userId },
    ),
  );

  promises.push(
    lcd(
      deleteItemFromTable(
        requiredEnvVar("USERS_TABLE"),
        event.arguments.input.userId,
      ),
      "deleteItemFromTable",
      { userId: event.arguments.input.userId },
    ),
  );
  log("main.ddbUserDeletion.success", "debug");

  promises.push(
    lcd(
      deleteItemFromTable(requiredEnvVar("CLUBS_TABLE"), clubId),
      "deleteItemFromTable",
      { clubId },
    ),
  );
  await Promise.all(promises);

  return {
    status: "OK",
  };
};
