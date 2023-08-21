import {
  AdminCreateUserCommandOutput,
  AdminSetUserPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { CreateSecretCommand } from "@aws-sdk/client-secrets-manager";
import { cachedCognitoIdpClient } from "@libs/cognito";
import { getLogCompletionDecorator } from "@libs/logCompletionDecorator";
import { logFn } from "@libs/logging";
import chance from "chance";
import { config as dotenvConfig } from "dotenv";
import { ulid } from "ulid";

import {
  cognitoAddUserToGroup,
  cognitoCreateUser,
  cognitoUpdateUserTenantId,
  ddbCreateClub,
  ddbCreateUser,
} from "../src/functions/add-club/handler";
import requiredEnvVar from "../src/libs/requiredEnvVar";
import { cachedSecretsManagerClient } from "./secretsManager";

const catPrefix = "ts-node-scripts.createAutomatedTestUsers.";
const log = logFn(catPrefix);
const lcd = getLogCompletionDecorator(catPrefix, "debug");

dotenvConfig();

async function cognitoSetNewPassword(userId: string, newPassword: string) {
  const params = {
    UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
    Username: userId,
    Password: newPassword,
    Permanent: true,
  };
  const command = new AdminSetUserPasswordCommand(params);
  await cachedCognitoIdpClient().send(command);
}

async function secretsManagerRecordPassword(email: string, password: string) {
  // Secret name must contain only alphanumeric characters and the characters /_+=.@-
  if (email.match(/[^/_+=.@\-A-Za-z0-9]/)) {
    throw new Error("Cannot set secret for id including disallowed characters");
  }
  const input = {
    Description: "Automated test user password",
    Name: `${requiredEnvVar("STAGE")}.automatedTestUserPassword.${email}`,
    SecretString: `{"password":"${password}"}`,
  };
  const command = new CreateSecretCommand(input);
  return cachedSecretsManagerClient().send(command);
}

async function createAutomatedTestUsers(): Promise<void> {
  const emailAdminSuper = `scorebridge8+${requiredEnvVar(
    "STAGE",
  )}-testUser-adminSuper@gmail.com`;
  const emailAdminClub00 = `scorebridge8+${requiredEnvVar(
    "STAGE",
  )}-testUser-adminClub-club00@gmail.com`;
  const emailAdminClub01 = `scorebridge8+${requiredEnvVar(
    "STAGE",
  )}-testUser-adminClub-club01@gmail.com`;
  const passAdminSuper = `${chance().string({ length: 18 })}`;
  const passAdminClub00 = `${chance().string({ length: 18 })}`;
  const passAdminClub01 = `${chance().string({ length: 18 })}`;

  const clubId0 = ulid();
  const clubId1 = ulid();
  const ddbCreateClubPromise0 = ddbCreateClub(
    clubId0,
    "Club 00 for automated testing",
  );
  const ddbCreateClubPromise1 = ddbCreateClub(
    clubId1,
    "Club 01 for automated testing",
  );
  const [
    createUserResultAdminSuper,
    createUserResultAdminClub0,
    createUserResultAdminClub1,
  ] = await Promise.all([
    lcd(
      cognitoCreateUser(emailAdminSuper, "SUPPRESS"),
      `cognitoCreateUser.success`,
      { emailAdminSuper },
    ) as Promise<AdminCreateUserCommandOutput>,
    lcd(
      cognitoCreateUser(emailAdminClub00, "SUPPRESS"),
      `cognitoCreateUser.success`,
      { emailAdminClub00 },
    ) as Promise<AdminCreateUserCommandOutput>,
    lcd(
      cognitoCreateUser(emailAdminClub01, "SUPPRESS"),
      `cognitoCreateUser.success`,
      { emailAdminClub01 },
    ) as Promise<AdminCreateUserCommandOutput>,
  ]);
  const userIdAdminSuper = createUserResultAdminSuper.User.Username;
  const userIdAdminClub0 = createUserResultAdminClub0.User.Username;
  const userIdAdminClub1 = createUserResultAdminClub1.User.Username;

  await Promise.all([
    cognitoAddUserToGroup(userIdAdminSuper, "adminSuper"),
    cognitoAddUserToGroup(userIdAdminClub0, "adminClub"),
    cognitoAddUserToGroup(userIdAdminClub1, "adminClub"),
    cognitoUpdateUserTenantId(userIdAdminClub0, clubId0),
    cognitoUpdateUserTenantId(userIdAdminClub1, clubId1),
    cognitoSetNewPassword(userIdAdminSuper, passAdminSuper),
    cognitoSetNewPassword(userIdAdminClub0, passAdminClub00),
    cognitoSetNewPassword(userIdAdminClub1, passAdminClub01),
    secretsManagerRecordPassword(emailAdminSuper, passAdminSuper),
    secretsManagerRecordPassword(emailAdminClub00, passAdminClub00),
    secretsManagerRecordPassword(emailAdminClub01, passAdminClub01),
    ddbCreateUser(userIdAdminSuper, emailAdminSuper),
    ddbCreateUser(userIdAdminClub0, emailAdminClub00),
    ddbCreateUser(userIdAdminClub1, emailAdminClub01),
    ddbCreateClubPromise0,
    ddbCreateClubPromise1,
  ]);
}

createAutomatedTestUsers()
  .then(() => log("createAutomatedTestUsers.success", "info"))
  .catch((e) => log("createAutomatedTestUsers", "error", e));
