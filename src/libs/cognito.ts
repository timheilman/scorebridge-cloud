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

let cognitoIdpClient;
export function cachedCognitoIdpClient() {
  if (cognitoIdpClient) {
    return cognitoIdpClient;
  }
  cognitoIdpClient = new CognitoIdentityProviderClient({
    region: requiredEnvVar("AWS_REGION"),
    credentials:
      process.env.NODE_ENV === "test"
        ? fromSsoUsingProfileFromEnv()
        : fromEnv(),
  });
  return cognitoIdpClient;
}
