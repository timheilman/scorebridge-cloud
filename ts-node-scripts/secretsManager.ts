import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

import fromSsoUsingProfileFromEnv from "../src/libs/from-sso-using-profile-from-env";
import requiredEnvVar from "../src/libs/requiredEnvVar";

let secretsManagerClient: SecretsManagerClient;
export const cachedSecretsManagerClient = () => {
  if (secretsManagerClient) {
    return secretsManagerClient;
  }
  secretsManagerClient = new SecretsManagerClient({
    region: requiredEnvVar("AWS_REGION"),
    credentials: fromSsoUsingProfileFromEnv(),
  });
  return secretsManagerClient;
};
