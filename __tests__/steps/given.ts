import { InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import { GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import chance from "chance";
import { config as dotenvConfig } from "dotenv";

import { cachedCognitoIdpClient } from "../../src/libs/cognito";
import { logFn } from "../../src/libs/logging";
import requiredEnvVar from "../../src/libs/requiredEnvVar";
import { cachedSecretsManagerClient } from "../../ts-node-scripts/secretsManager";

const log = logFn("__tests__.steps.given.");

dotenvConfig();
const lowerCaseLetters = "abcdefghijklmnopqrstuvwxyz";

export const aRandomClubName = (): string =>
  `scorebridge-cloud e2e test club ${chance().string({
    length: 8,
    pool: lowerCaseLetters,
  })}`;
export const aRandomUser = (): {
  name: string;
  password: string;
  email: string;
} => {
  const firstName = chance().first({ nationality: "en" });
  const lastName = chance().first({ nationality: "en" });
  const suffix = chance().string({
    length: 4,
    pool: lowerCaseLetters,
  });
  const name = `${firstName} ${lastName} ${suffix}`;
  const password = `${chance().string({ length: 8 })}`;
  const email = `tdh+sb-test-random-user-${firstName}-${lastName}-${suffix}@stanfordalumni.org`;

  return {
    name,
    password,
    email,
  };
};

export const aLoggedInUser = async (email: string, password: string) => {
  const auth = await cachedCognitoIdpClient().send(
    new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: requiredEnvVar("COGNITO_USER_POOL_CLIENT_ID_AUTOMATED_TEST"),
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    }),
  );

  log("aLoggedInUser.signInSuccess", "debug", { email });

  return {
    idToken: auth.AuthenticationResult.IdToken,
    accessToken: auth.AuthenticationResult.AccessToken,
  };
};

async function fetchSecret(SecretId: string) {
  log("fetchSecret", "debug", { SecretId });
  const result = await cachedSecretsManagerClient().send(
    new GetSecretValueCommand({ SecretId }),
  );
  return result.SecretString;
}

async function getAutomatedTestUserPassword(premadeTestAcctEmail: string) {
  const SecretId = `${requiredEnvVar(
    "STAGE",
  )}.automatedTestUserPassword.${premadeTestAcctEmail}`;
  const result = await fetchSecret(SecretId);
  const password = (JSON.parse(result) as Record<"password", string>)[
    "password"
  ];
  return password;
}

export const aLoggedInAdminSuper = async () => {
  const premadeAdminSuperEmail = `scorebridge8+${requiredEnvVar(
    "STAGE",
  )}-testUser-adminSuper@gmail.com`;
  const password = await getAutomatedTestUserPassword(premadeAdminSuperEmail);
  log("aLoggedInAdminSuper.end", "debug", { password });
  return aLoggedInUser(premadeAdminSuperEmail, password);
};

export const aLoggedInAdminClub = async () => {
  const premadeAdminClubEmail = `scorebridge8+${requiredEnvVar(
    "STAGE",
  )}-testUser-adminClub-club00@gmail.com`;
  const password = await getAutomatedTestUserPassword(premadeAdminClubEmail);
  return aLoggedInUser(premadeAdminClubEmail, password);
};
