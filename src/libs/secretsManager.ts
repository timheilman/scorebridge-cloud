import { SecretsManagerClient } from "@aws-sdk/client-secrets-manager";

import { cachedSecretsManagerClient } from "../../scorebridge-ts-submodule/cachedSecretsManagerClient";
import requiredEnvVar from "./requiredEnvVar";

export function secretsManagerClient(): SecretsManagerClient {
  return cachedSecretsManagerClient(
    requiredEnvVar("AWS_REGION"),
    process.env.SB_TEST_AWS_CLI_PROFILE
      ? process.env.SB_TEST_AWS_CLI_PROFILE
      : null,
  );
}
