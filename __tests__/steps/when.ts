import { config as dotenvConfig } from "dotenv";
import { PostConfirmationTriggerEvent } from "aws-lambda";
// eslint-disable-next-line import/no-unresolved,import/extensions
import { main } from "../../src/functions/confirm-user-signup/handler";

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

  await main(event /* , context */);
};

// eslint-disable-next-line import/prefer-default-export
export { weInvokeConfirmUserSignup };
