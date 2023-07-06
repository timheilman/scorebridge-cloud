// eslint-disable-next-line import/no-unresolved,import/extensions,import/no-extraneous-dependencies
import { fromSSO } from "@aws-sdk/credential-providers";

// eslint-disable-next-line import/prefer-default-export
export const fromSsoUsingProfileFromEnv = () =>
  fromSSO({
    profile:
      process.env.SB_TEST_AWS_CLI_PROFILE ||
      "No ScoreBridge test AWS cli profile name found",
  });
