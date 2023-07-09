// eslint-disable-next-line import/no-extraneous-dependencies
import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
// eslint-disable-next-line import/extensions,import/no-unresolved
import { fromSsoUsingProfileFromEnv } from "../src/libs/from-sso-using-profile-from-env";
// eslint-disable-next-line import/extensions,import/no-unresolved
import requiredEnvVar from "./requiredEnvVar";

export default function createCognitoIdentityProviderClient() {
  return new CognitoIdentityProviderClient({
    region: requiredEnvVar("AWS_REGION"),
    credentials: fromSsoUsingProfileFromEnv(),
  });
}
