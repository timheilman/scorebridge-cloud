import chance from "chance";
import { config as dotenvConfig } from "dotenv";
import { InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cachedCognitoIdpClient } from "../../src/libs/cognito";
import requiredEnvVar from "../../src/libs/requiredEnvVar";

dotenvConfig();
const lowerCaseLetters = "abcdefghijklmnopqrstuvwxyz";

export const aRandomClubName = (): string =>
  `Randomized Club Name ${chance().string({
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

export const aLoggedInUser = async (email, password) => {
  const auth = await cachedCognitoIdpClient().send(
    new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: requiredEnvVar("COGNITO_USER_POOL_CLIENT_ID_AUTOMATED_TESTS"),
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    }),
  );

  console.log(`[${email}] - signed in`);

  return {
    idToken: auth.AuthenticationResult.IdToken,
    accessToken: auth.AuthenticationResult.AccessToken,
  };
};
