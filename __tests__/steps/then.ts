import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { config as dotenvConfig } from "dotenv";
import {
  AdminGetUserCommand,
  AdminGetUserCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import { cachedCognitoIdpClient } from "../../src/libs/cognito";
import requiredEnvVar from "../../src/libs/requiredEnvVar";
import { cachedDynamoDbClient } from "../../src/libs/ddb";

dotenvConfig();

export const userExistsInCognito = async (
  userId
): Promise<AdminGetUserCommandOutput> =>
  cachedCognitoIdpClient().send(
    new AdminGetUserCommand({
      UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
      Username: userId,
    })
  );

export const userExistsInUsersTable = async (id: string) => {
  console.log(`looking for user [${id}] in table [${process.env.USERS_TABLE}]`);
  const response = await cachedDynamoDbClient().send(
    new GetItemCommand({
      TableName: process.env.USERS_TABLE,
      Key: marshall({
        id,
      }),
    })
  );
  const item = unmarshall(response.Item);

  if (item) {
    return item;
  }

  throw new Error(
    `User with ID [${id}] not found in table [${process.env.USERS_TABLE}]`
  );
};
export const clubExistsInClubsTable = async (id: string) => {
  console.log(`looking for club [${id}] in table [${process.env.CLUBS_TABLE}]`);
  const response = await cachedDynamoDbClient().send(
    new GetItemCommand({
      TableName: process.env.CLUBS_TABLE,
      Key: marshall({
        id,
      }),
    })
  );
  const item = unmarshall(response.Item);

  if (item) {
    return item;
  }

  throw new Error(
    `User with ID [${id}] not found in table [${process.env.USERS_TABLE}]`
  );
};
