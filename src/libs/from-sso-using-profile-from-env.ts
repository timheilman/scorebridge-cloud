import { fromSSO } from "@aws-sdk/credential-providers";

// eslint-disable-next-line import/prefer-default-export
export const fromSsoUsingProfileFromEnv = () =>
  fromSSO({
    profile:
      process.env.SB_TEST_AWS_CLI_PROFILE ||
      "Please_set_SB_TEST_AWS_CLI_PROFILE_in_env_and_use_aws_sso_login",
  });
