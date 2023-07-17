import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

import fromSsoUsingProfileFromEnv from "../src/libs/from-sso-using-profile-from-env";
import requiredEnvVar from "../src/libs/requiredEnvVar";

export default function createCognitoIdentityProviderClient() {
  return new CognitoIdentityProviderClient({
    region: requiredEnvVar("AWS_REGION"),
    credentials: fromSsoUsingProfileFromEnv(),
  });
}
