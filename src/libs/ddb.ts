import { DeleteItemCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { fromEnv } from "@aws-sdk/credential-providers";
import { marshall } from "@aws-sdk/util-dynamodb";

import fromSsoUsingProfileFromEnv from "./from-sso-using-profile-from-env";
import requiredEnvVar from "./requiredEnvVar";

let dynamoDbClient: DynamoDBClient;
export const cachedDynamoDbClient = () => {
  if (dynamoDbClient) {
    return dynamoDbClient;
  }
  dynamoDbClient = new DynamoDBClient({
    region: requiredEnvVar("AWS_REGION"),
    credentials: process.env.SB_TEST_AWS_CLI_PROFILE
      ? fromSsoUsingProfileFromEnv()
      : fromEnv(),
  });
  return dynamoDbClient;
};

export function deleteItemFromTable(
  tableName: string,
  key: Record<string, unknown>,
) {
  return cachedDynamoDbClient().send(
    new DeleteItemCommand({
      TableName: tableName,
      Key: marshall(key),
    }),
  );
}

export function deleteItemFromSimpleIdTable(tableName: string, id: string) {
  const key = { id: id };
  return deleteItemFromTable(tableName, key);
}
