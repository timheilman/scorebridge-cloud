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

async function destroyCognitoUser(userId: string) {
  const deleteUserParams = {
    UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
    Username: userId,
  };

  const deleteUserCommand = new AdminDeleteUserCommand(deleteUserParams);
  return await cachedCognitoIdpClient().send(deleteUserCommand);
}

export const main: AppSyncResolverHandler<
  MutationRemoveClubAndAdminArgs,
  RemoveClubAndAdminResponse
> = async (
  event: AppSyncResolverEvent<MutationRemoveClubAndAdminArgs>,
): Promise<RemoveClubAndAdminResponse> => {
  const { clubId } = event.arguments.input;
  const promises: Promise<unknown>[] = [];
  promises.push(destroyCognitoUser(event.arguments.input.userId));

  promises.push(
    cachedDdbClient().send(
      new DeleteItemCommand({
        TableName: requiredEnvVar("USERS_TABLE"),
        Key: marshall({ id: event.arguments.input.userId }),
      }),
    ),
  );
  console.log("Ddb user deleted successfully.");

  promises.push(
    cachedDdbClient().send(
      new DeleteItemCommand({
        TableName: requiredEnvVar("CLUBS_TABLE"),
        Key: { id: { S: clubId } },
      }),
    ),
  );

  await Promise.all(promises);

  return {
    status: "OK",
  };
};
