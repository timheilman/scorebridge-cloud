import { AdminDeleteUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { cachedCognitoIdpClient } from "@libs/cognito";
import { cachedDynamoDbClient } from "@libs/ddb";
import { middyWithErrorHandling } from "@libs/lambda";
import { getLogCompletionDecorator } from "@libs/logCompletionDecorator";
import { logFn } from "@libs/logging";
import requiredEnvVar from "@libs/requiredEnvVar";
import { AppSyncResolverEvent } from "aws-lambda";
import { AppSyncResolverHandler } from "aws-lambda/trigger/appsync-resolver";

import {
  DeleteClubAndAdminResponse,
  MutationDeleteClubAndAdminArgs,
} from "../../../appsync";

const catPrefix = "src.functions.delete-club-and-admin.handler.";
const lcd = getLogCompletionDecorator(catPrefix, "debug");
const log = logFn(catPrefix);

export async function cognitoDestroyUser(userId: string) {
  return cachedCognitoIdpClient().send(
    new AdminDeleteUserCommand({
      UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
      Username: userId,
    }),
  );
}

export function deleteItemFromTable(tableName: string, userId: string) {
  return cachedDynamoDbClient().send(
    new DeleteItemCommand({
      TableName: tableName,
      Key: marshall({ id: userId }),
    }),
  );
}

const almostMain: AppSyncResolverHandler<
  MutationDeleteClubAndAdminArgs,
  DeleteClubAndAdminResponse
> = async (
  event: AppSyncResolverEvent<MutationDeleteClubAndAdminArgs>,
): Promise<DeleteClubAndAdminResponse> => {
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
export const main = middyWithErrorHandling(almostMain);
