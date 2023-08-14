import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { fromEnv } from "@aws-sdk/credential-providers";

import fromSsoUsingProfileFromEnv from "./from-sso-using-profile-from-env";
import requiredEnvVar from "./requiredEnvVar";

export function createCognitoIdentityProviderClient() {
  return new CognitoIdentityProviderClient({
    region: requiredEnvVar("AWS_REGION"),
    credentials: fromEnv(),
  });
}

let cognitoIdpClient: CognitoIdentityProviderClient;
export function cachedCognitoIdpClient(): CognitoIdentityProviderClient {
  if (cognitoIdpClient) {
    return cognitoIdpClient;
  }
  cognitoIdpClient = new CognitoIdentityProviderClient({
    region: requiredEnvVar("AWS_REGION"),
    credentials: process.env.SB_TEST_AWS_CLI_PROFILE
      ? fromSsoUsingProfileFromEnv()
      : fromEnv(),
  });
  return cognitoIdpClient;
}
