import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import requiredEnvVar from "@libs/requiredEnvVar";
import { fromEnv } from "@aws-sdk/credential-providers";

export function createCognitoIdentityProviderClient() {
  return new CognitoIdentityProviderClient({
    region: requiredEnvVar("AWS_REGION"),
    credentials: fromEnv(),
  });
}
