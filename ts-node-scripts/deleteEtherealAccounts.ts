import {
  ListUsersCommand,
  ListUsersCommandInput,
  UserType,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  cognitoDestroyUser,
  deleteItemFromTable,
} from "@functions/remove-club-and-admin/handler";

import { cachedCognitoIdpClient } from "../src/libs/cognito";
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

function userAttr(user: UserType, attrName: string) {
  return user.Attributes.find((a) => a.Name === attrName)?.Value;
}

async function deleteUser(user: UserType) {
  const promises: Promise<unknown>[] = [];
  if (userAttr(user, "tenantId")) {
    promises.push(
      deleteItemFromTable(
        requiredEnvVar("CLUBS_TABLE"),
        userAttr(user, "tenantId"),
      ),
    );
  }
  promises.push(
    deleteItemFromTable(requiredEnvVar("USERS_TABLE"), user.Username),
  );
  promises.push(cognitoDestroyUser(user.Username));
  return Promise.all(promises);
}

async function handleUsersList(users: UserType[]) {
  return Promise.all(
    users
      .filter((user) => {
        userAttr(user, "email").match(/@ethereal\.email$/);
      })
      .map((user) => deleteUser(user)),
  );
}

async function deleteEtherealAccounts() {
  let response = await cognitoListUsers();
  const promises: Promise<unknown>[] = [];
  promises.push(handleUsersList(response.Users));
  while (response.PaginationToken) {
    response = await cognitoListUsers();
    promises.push(handleUsersList(response.Users));
  }
  await Promise.all(promises);
}

deleteEtherealAccounts()
  .then(() => console.log("done"))
  .catch((e) => console.error("problem", e));
