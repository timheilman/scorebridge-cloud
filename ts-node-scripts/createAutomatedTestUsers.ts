import {
  AdminCreateUserCommandOutput,
  AdminGetUserCommand,
  AdminSetUserPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  CreateSecretCommand,
  ResourceExistsException,
  UpdateSecretCommand,
} from "@aws-sdk/client-secrets-manager";
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
} from "../src/functions/./create-club/handler";
import requiredEnvVar from "../src/libs/requiredEnvVar";
import { cachedSecretsManagerClient } from "./secretsManager";

const catPrefix = "ts-node-scripts.createAutomatedTestUsers.";
const log = logFn(catPrefix);
const lcd = getLogCompletionDecorator(catPrefix, "debug");

dotenvConfig();

const UserPoolId = requiredEnvVar("COGNITO_USER_POOL_ID");

async function cognitoSetNewPassword(userId: string, newPassword: string) {
  const params = {
    UserPoolId,
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
  const SecretId = `${requiredEnvVar(
    "STAGE",
  )}.automatedTestUserPassword.${email}`;
  const SecretString = `{"password":"${password}"}`;
  const command = new CreateSecretCommand({
    Description: "Automated test user password",
    Name: SecretId,
    SecretString,
  });
  try {
    return await cachedSecretsManagerClient().send(command);
  } catch (e) {
    if (e instanceof ResourceExistsException) {
      const changeCommand = new UpdateSecretCommand({
        SecretId,
        SecretString,
      });
      return await cachedSecretsManagerClient().send(changeCommand);
    } else {
      throw e;
    }
  }
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
  const emails = [emailAdminSuper, emailAdminClub00, emailAdminClub01];
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
  const settledCogUserCreateResults = await Promise.allSettled([
    lcd(cognitoCreateUser(emailAdminSuper, "SUPPRESS"), `cognitoCreateUser`, {
      emailAdminSuper,
    }) as Promise<AdminCreateUserCommandOutput>,
    lcd(cognitoCreateUser(emailAdminClub00, "SUPPRESS"), `cognitoCreateUser`, {
      emailAdminClub00,
    }) as Promise<AdminCreateUserCommandOutput>,
    lcd(cognitoCreateUser(emailAdminClub01, "SUPPRESS"), `cognitoCreateUser`, {
      emailAdminClub01,
    }) as Promise<AdminCreateUserCommandOutput>,
  ]);
  const [userIdAdminSuper, userIdAdminClub0, userIdAdminClub1] =
    await Promise.all(
      settledCogUserCreateResults.map((settled, index) => {
        if (settled.status === "fulfilled") {
          return Promise.resolve(settled.value.User.Username);
        }
        return cachedCognitoIdpClient()
          .send(
            new AdminGetUserCommand({ UserPoolId, Username: emails[index] }),
          )
          .then((r) => r.Username);
      }),
    );

  log(
    "endResult",
    "info",
    await Promise.allSettled([
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
    ]),
  );
}

createAutomatedTestUsers()
  .then(() => log("createAutomatedTestUsers.success", "info"))
  .catch((e) => log("createAutomatedTestUsers", "error", e));
