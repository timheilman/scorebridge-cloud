import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { fromEnv } from "@aws-sdk/credential-providers";

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
