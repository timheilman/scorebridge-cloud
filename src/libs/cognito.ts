import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import requiredEnvVar from "@libs/requiredEnvVar";
import { fromEnv } from "@aws-sdk/credential-providers";
import fromSsoUsingProfileFromEnv from "@libs/from-sso-using-profile-from-env";

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
