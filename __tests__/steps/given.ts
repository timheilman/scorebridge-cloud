import chance from "chance";
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  AdminConfirmSignUpCommand,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { config as dotenvConfig } from "dotenv";
import fromSsoUsingProfileFromEnv from "../../src/libs/from-sso-using-profile-from-env";

dotenvConfig();

const aRandomUser = (): { name: string; password: string; email: string } => {
  const firstName = chance().first({ nationality: "en" });
  const lastName = chance().first({ nationality: "en" });
  const suffix = chance().string({
    length: 4,
    pool: "abcdefghijklmnopqrstuvwxyz",
  });
  const name = `${firstName} ${lastName} ${suffix}`;
  const password = `${chance().string({ length: 8 })}a1A!`;
  const email = `${firstName}-${lastName}-${suffix}@appsyncmasterclass.com`;

  return {
    name,
    password,
    email,
  };
};

const anAuthenticatedUser = async () => {
  const { name, email, password } = aRandomUser();

  const cognito = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION,
    credentials: fromSsoUsingProfileFromEnv(),
  });

  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const clientId = process.env.WEB_COGNITO_USER_POOL_CLIENT_ID;

  const signUpResp = await cognito.send(
    new SignUpCommand({
      ClientId: clientId,
      Username: email,
      Password: password,
      UserAttributes: [{ Name: "name", Value: name }],
    })
  );

  const username = signUpResp.UserSub;
  console.log(`[${email}] - user has signed up [${username}]`);

  await cognito.send(
    new AdminConfirmSignUpCommand({
      UserPoolId: userPoolId,
      Username: username,
    })
  );

  console.log(`[${email}] - confirmed sign up`);

  const auth = await cognito.send(
    new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: clientId,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    })
  );

  console.log(`[${email}] - signed in`);

  return {
    username,
    name,
    email,
    idToken: auth.AuthenticationResult.IdToken,
    accessToken: auth.AuthenticationResult.AccessToken,
  };
};

export { aRandomUser, anAuthenticatedUser };
