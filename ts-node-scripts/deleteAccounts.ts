import {
  ListUsersCommand,
  ListUsersCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import { deleteItemFromSimpleIdTable } from "@libs/ddb";

import { cognitoClient, cognitoDestroyUser } from "../src/libs/cognito";
import requiredEnvVar from "../src/libs/requiredEnvVar";

async function cognitoListUsers(paginationToken?: string) {
  const input: ListUsersCommandInput = {
    UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
  };
  if (paginationToken) {
    input.PaginationToken = paginationToken;
  }

  const listUsersCommandOutput = await cognitoClient().send(
    new ListUsersCommand(input),
  );
  if (!listUsersCommandOutput.Users) {
    return { Users: [], PaginationToken: undefined };
  }
  return {
    Users: listUsersCommandOutput.Users.map((u) => ({
      Username: u.Username!,
      Attributes: u.Attributes!.map((a) => ({
        Name: a.Name!,
        Value: a.Value!,
      })),
    })),
    PaginationToken: listUsersCommandOutput.PaginationToken,
  };
}

export function userAttr(
  user: { Attributes: { Name: string; Value: string }[] },
  attrName: string,
) {
  return user.Attributes.find((a) => a.Name === attrName)?.Value;
}

async function deleteUser(user: {
  Username: string;
  Attributes: { Name: string; Value: string }[];
}) {
  const promises: Promise<unknown>[] = [];
  const tenantId = userAttr(user, "tenantId");
  if (tenantId) {
    promises.push(
      deleteItemFromSimpleIdTable(requiredEnvVar("CLUBS_TABLE"), tenantId),
    );
  }
  promises.push(
    deleteItemFromSimpleIdTable(requiredEnvVar("USERS_TABLE"), user.Username),
  );
  promises.push(cognitoDestroyUser(user.Username));
  return Promise.all(promises);
}

async function handleUsersList(
  users: { Username: string; Attributes: { Name: string; Value: string }[] }[],
  predicate: (user: {
    Attributes: { Name: string; Value: string }[];
  }) => boolean,
) {
  return Promise.all(users.filter(predicate).map((user) => deleteUser(user)));
}

export async function deleteAccounts(
  predicate: (user: {
    Attributes: { Name: string; Value: string }[];
  }) => boolean,
) {
  let response = await cognitoListUsers();
  const promises: Promise<unknown>[] = [];
  promises.push(handleUsersList(response.Users, predicate));
  while (response.PaginationToken) {
    response = await cognitoListUsers();
    promises.push(handleUsersList(response.Users, predicate));
  }
  await Promise.all(promises);
}
