import {
  AdminCreateUserCommandOutput,
  AdminSetUserPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { CreateSecretCommand } from "@aws-sdk/client-secrets-manager";
import { cachedCognitoIdpClient } from "@libs/cognito";
import { getLogCompletionDecorator } from "@libs/log-completion-decorator";
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
const log = logFn(__filename);
const lcd = getLogCompletionDecorator(__filename, "debug");

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
  const emailAdminClub = `scorebridge8+${requiredEnvVar(
    "STAGE",
  )}-testUser-adminClub@gmail.com`;
  const passAdminSuper = `${chance().string({ length: 18 })}`;
  const passAdminClub = `${chance().string({ length: 18 })}`;

  const clubId = ulid();
  const ddbCreateClubPromise = ddbCreateClub(
    clubId,
    "Club for automated testing",
  );
  const [createUserResultAdminSuper, createUserResultAdminClub] =
    await Promise.all([
      lcd(
        cognitoCreateUser(emailAdminSuper, "SUPPRESS"),
        `Created ${emailAdminSuper} in cognito`,
      ) as Promise<AdminCreateUserCommandOutput>,
      lcd(
        cognitoCreateUser(emailAdminClub, "SUPPRESS"),
        `Created ${emailAdminClub} in cognito`,
      ) as Promise<AdminCreateUserCommandOutput>,
    ]);
  const userIdAdminSuper = createUserResultAdminSuper.User.Username;
  const userIdAdminClub = createUserResultAdminClub.User.Username;

  await Promise.all([
    cognitoAddUserToGroup(userIdAdminSuper, "adminSuper"),
    cognitoAddUserToGroup(userIdAdminClub, "adminClub"),
    cognitoUpdateUserTenantId(userIdAdminClub, clubId),
    cognitoSetNewPassword(userIdAdminSuper, passAdminSuper),
    cognitoSetNewPassword(userIdAdminClub, passAdminClub),
    secretsManagerRecordPassword(emailAdminSuper, passAdminSuper),
    secretsManagerRecordPassword(emailAdminClub, passAdminClub),
    ddbCreateUser(userIdAdminSuper, emailAdminSuper),
    ddbCreateUser(userIdAdminClub, emailAdminClub),
    ddbCreateClubPromise,
  ]);
}

createAutomatedTestUsers()
  .then(() => log("info", "done"))
  .catch((e) => log("error", "problem", e));
