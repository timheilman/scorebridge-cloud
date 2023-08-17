import { AdminDeleteUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { DeleteItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { fromEnv } from "@aws-sdk/credential-providers";
import { marshall } from "@aws-sdk/util-dynamodb";
import { cachedCognitoIdpClient } from "@libs/cognito";
import requiredEnvVar from "@libs/requiredEnvVar";
import { AppSyncResolverEvent } from "aws-lambda";
import { AppSyncResolverHandler } from "aws-lambda/trigger/appsync-resolver";

import {
  MutationRemoveClubAndAdminArgs,
  RemoveClubAndAdminResponse,
} from "../../../appsync";

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
  const deleteUserParams = {
    UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
    Username: userId,
  };

  const deleteUserCommand = new AdminDeleteUserCommand(deleteUserParams);
  return await cachedCognitoIdpClient().send(deleteUserCommand);
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
  promises.push(cognitoDestroyUser(event.arguments.input.userId));

  promises.push(
    deleteItemFromTable(
      requiredEnvVar("USERS_TABLE"),
      event.arguments.input.userId,
    ),
  );
  console.log("Ddb user deleted successfully.");

  promises.push(deleteItemFromTable(requiredEnvVar("CLUBS_TABLE"), clubId));
  await Promise.all(promises);

  return {
    status: "OK",
  };
};
