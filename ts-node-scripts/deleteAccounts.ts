import {
  ListUsersCommand,
  ListUsersCommandInput,
  UserType,
} from "@aws-sdk/client-cognito-identity-provider";
import { deleteItemFromSimpleIdTable } from "@libs/ddb";

import {
  cachedCognitoIdpClient,
  cognitoDestroyUser,
} from "../src/libs/cognito";
import requiredEnvVar from "../src/libs/requiredEnvVar";

async function cognitoListUsers(paginationToken?: string) {
  const input: ListUsersCommandInput = {
    UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
  };
  if (paginationToken) {
    input["PaginationToken"] = paginationToken;
  }

  return cachedCognitoIdpClient().send(new ListUsersCommand(input));
}

export function userAttr(user: UserType, attrName: string) {
  return user.Attributes.find((a) => a.Name === attrName)?.Value;
}

async function deleteUser(user: UserType) {
  const promises: Promise<unknown>[] = [];
  if (userAttr(user, "tenantId")) {
    promises.push(
      deleteItemFromSimpleIdTable(
        requiredEnvVar("CLUBS_TABLE"),
        userAttr(user, "tenantId"),
      ),
    );
  }
  promises.push(
    deleteItemFromSimpleIdTable(requiredEnvVar("USERS_TABLE"), user.Username),
  );
  promises.push(cognitoDestroyUser(user.Username));
  return Promise.all(promises);
}

async function handleUsersList(
  users: UserType[],
  predicate: (user: UserType) => boolean,
) {
  return Promise.all(users.filter(predicate).map((user) => deleteUser(user)));
}

export async function deleteAccounts(predicate: (user: UserType) => boolean) {
  let response = await cognitoListUsers();
  const promises: Promise<unknown>[] = [];
  promises.push(handleUsersList(response.Users, predicate));
  while (response.PaginationToken) {
    response = await cognitoListUsers();
    promises.push(handleUsersList(response.Users, predicate));
  }
  await Promise.all(promises);
}
