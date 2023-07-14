import { AppSyncResolverEvent } from "aws-lambda";
import { AppSyncResolverHandler } from "aws-lambda/trigger/appsync-resolver";
import { fromEnv } from "@aws-sdk/credential-providers";
import {
  AdminDeleteUserCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import requiredEnvVar from "@libs/requiredEnvVar";
import { DeleteItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import {
  MutationRemoveClubAndAdminArgs,
  RemoveClubAndAdminResponse,
} from "../../../appsync";

let cognitoIdpClient;
let dynamoDbClient;

function cachedCognitoIdpClient() {
  if (cognitoIdpClient) {
    return cognitoIdpClient;
  }
  cognitoIdpClient = new CognitoIdentityProviderClient({
    region: requiredEnvVar("AWS_REGION"),
    credentials: fromEnv(),
  });
  return cognitoIdpClient;
}

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
  try {
    const deleteUserParams = {
      UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
      Username: userId,
    };

    const deleteUserCommand = new AdminDeleteUserCommand(deleteUserParams);
    return await cachedCognitoIdpClient().send(deleteUserCommand);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}

// eslint-disable-next-line import/prefer-default-export
export const main: AppSyncResolverHandler<
  MutationRemoveClubAndAdminArgs,
  RemoveClubAndAdminResponse
> = async (
  event: AppSyncResolverEvent<MutationRemoveClubAndAdminArgs>
): Promise<RemoveClubAndAdminResponse> => {
  const { clubId, userId } = event.arguments.input;
  try {
    await destroyCognitoUser(userId);
  } catch (error) {
    console.error("Error destroying cognito user", error);
    throw error;
  }

  try {
    const deleteUserDdbCommand = new DeleteItemCommand({
      TableName: requiredEnvVar("USERS_TABLE"),
      Key: marshall({ id: userId }),
    });
    await cachedDdbClient().send(deleteUserDdbCommand);
  } catch (error) {
    console.error("Error deleting ddb user", error);
    throw error;
  }
  console.log("Ddb user deleted successfully.");

  try {
    const deleteClubDdbCommand = new DeleteItemCommand({
      TableName: requiredEnvVar("CLUBS_TABLE"),
      Key: { id: { S: clubId } },
    });
    await cachedDdbClient().send(deleteClubDdbCommand);
  } catch (error) {
    console.error("Error deleting ddb club", error);
    throw error;
  }
  console.log("Ddb club deleted successfully.");

  return {
    status: "OK",
  };
};
