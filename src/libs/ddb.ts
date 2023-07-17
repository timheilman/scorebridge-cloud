import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { fromEnv } from "@aws-sdk/credential-providers";
import fromSsoUsingProfileFromEnv from "./from-sso-using-profile-from-env";

let dynamoDbClient;
export const cachedDynamoDbClient = () => {
  if (dynamoDbClient) {
    return dynamoDbClient;
  }
  dynamoDbClient = new DynamoDBClient({
    region: process.env.AWS_REGION || "NO_REGION_FOUND_IN_ENV",
    credentials:
      process.env.NODE_ENV === "test"
        ? fromSsoUsingProfileFromEnv()
        : fromEnv(),
  });
  return dynamoDbClient;
};
