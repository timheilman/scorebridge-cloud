import { config as dotenvConfig } from "dotenv";
import { PostConfirmationTriggerEvent } from "aws-lambda";
// eslint-disable-next-line import/no-unresolved,import/extensions
import { fromSSO } from "@aws-sdk/credential-providers";
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  AdminConfirmSignUpCommand,
  // eslint-disable-next-line import/no-unresolved
} from "@aws-sdk/client-cognito-identity-provider";
// eslint-disable-next-line import/extensions,import/no-unresolved
import { main as confirmUserSignup } from "../../src/functions/confirm-user-signup/handler";

dotenvConfig();

const weInvokeConfirmUserSignup = async (
  username: string,
  name: string,
  email: string
) => {
  // const context = {};
  const event: PostConfirmationTriggerEvent = {
    callerContext: {
      awsSdkVersion: "mockedAwsSdkVersion",
      clientId: "mockedClientId",
    },
    version: "mockedVersion",
    region: process.env.AWS_REGION,
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    userName: username,
    triggerSource: "PostConfirmation_ConfirmSignUp",
    request: {
      userAttributes: {
        sub: username,
        "cognito:email_alias": email,
        "cognito:user_status": "CONFIRMED",
        email_verified: "false",
        name,
        email,
      },
    },
    response: {},
  };

  await confirmUserSignup(event /* , context */);
};

const aUserSignsUp = async (password: string, name: string, email: string) => {
  const cognito = new CognitoIdentityProviderClient({
    region: "YOUR_REGION",
    credentials: await fromSSO(),
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

  return {
    username,
    name,
    email,
  };
};

// eslint-disable-next-line import/prefer-default-export
export { weInvokeConfirmUserSignup, aUserSignsUp };
