import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";
import { fromEnv } from "@aws-sdk/credential-providers";

import fromSsoUsingProfileFromEnv from "./from-sso-using-profile-from-env";
import requiredEnvVar from "./requiredEnvVar";

let secretsManagerClient: SecretsManagerClient;
export function cachedSecretsManagerClient(): SecretsManagerClient {
  if (secretsManagerClient) {
    return secretsManagerClient;
  }
  secretsManagerClient = new SecretsManagerClient({
    region: requiredEnvVar("AWS_REGION"),
    credentials: process.env.SB_TEST_AWS_CLI_PROFILE
      ? fromSsoUsingProfileFromEnv()
      : fromEnv(),
  });
  return secretsManagerClient;
}
