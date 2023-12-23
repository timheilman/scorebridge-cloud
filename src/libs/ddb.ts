import { DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

import { cachedDynamoDbClient } from "../../scorebridge-ts-submodule/cachedDynamoDbClient";
import requiredEnvVar from "./requiredEnvVar";

export const dynamoDbClient = () => {
  return cachedDynamoDbClient(
    requiredEnvVar("AWS_REGION"),
    process.env.SB_TEST_AWS_CLI_PROFILE
      ? process.env.SB_TEST_AWS_CLI_PROFILE
      : null,
  );
};

export function deleteItemFromTable(
  tableName: string,
  key: Record<string, unknown>,
) {
  return dynamoDbClient().send(
    new DeleteItemCommand({
      TableName: tableName,
      Key: marshall(key),
      ReturnValues: "ALL_OLD",
    }),
  );
}

export function deleteItemFromSimpleIdTable(tableName: string, id: string) {
  const key = { id: id };
  return deleteItemFromTable(tableName, key);
}
