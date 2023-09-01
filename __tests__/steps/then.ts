import {
  AdminGetUserCommand,
  AdminGetUserCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import { GetItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { config as dotenvConfig } from "dotenv";

import { cognitoClient } from "../../src/libs/cognito";
import { cachedDynamoDbClient } from "../../src/libs/ddb";
import { logFn } from "../../src/libs/logging";
import requiredEnvVar from "../../src/libs/requiredEnvVar";
const log = logFn("__tests__.steps.then.");
dotenvConfig();

const getUserCognito = async (
  userId: string,
): Promise<AdminGetUserCommandOutput> =>
  cognitoClient().send(
    new AdminGetUserCommand({
      UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
      Username: userId,
    }),
  );

export const userExistsInCognito = async (
  userId: string,
): Promise<AdminGetUserCommandOutput> => getUserCognito(userId);

export const userDoesNotExistInCognito = async (userId: string) => {
  try {
    await getUserCognito(userId);
    expect(true).toBe(false);
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(e.name).toBe("UserNotFoundException");
  }
};

async function getUserDdb(id: string) {
  const response = await cachedDynamoDbClient().send(
    new GetItemCommand({
      TableName: process.env.USERS_TABLE,
      Key: marshall({
        id,
      }),
    }),
  );
  log("getUserDdb.success", "debug", { response });
  return response.Item;
}

export const userExistsInUsersTable = async (id: string) => {
  log("userExistsInUsersTable.start", "debug", {
    id,
    usersTable: process.env.USERS_TABLE,
  });
  const item = await getUserDdb(id);

  if (item) {
    return unmarshall(item);
  }

  throw new Error(
    `User with ID [${id}] not found in table [${process.env.USERS_TABLE}]`,
  );
};

export const userDoesNotExistInUsersTable = async (id: string) => {
  expect(await getUserDdb(id)).toBeUndefined();
};

async function getClubDdb(id: string) {
  const response = await cachedDynamoDbClient().send(
    new GetItemCommand({
      TableName: process.env.CLUBS_TABLE,
      Key: marshall({
        id,
      }),
    }),
  );
  return response.Item;
}

export const clubExistsInClubsTable = async (id: string) => {
  log("clubExistsInClubsTable.start", "debug", {
    id,
    clubsTable: process.env.CLUBS_TABLE,
  });
  const item = await getClubDdb(id);

  if (item) {
    return unmarshall(item);
  }

  throw new Error(
    `Club with ID [${id}] not found in table [${process.env.CLUBS_TABLE}]`,
  );
};

export const clubDoesNotExistInClubsTable = async (id: string) => {
  expect(await getClubDdb(id)).toBeUndefined();
};
