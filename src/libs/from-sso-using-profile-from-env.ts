import { fromSSO } from "@aws-sdk/credential-providers";

export default () => {
  const profileFromEnv = process.env.SB_TEST_AWS_CLI_PROFILE;
  if (!profileFromEnv) {
    throw new Error(
      "Please set SB TEST AWS CLI PROFILE in env and use aws sso login",
    );
  }
  return fromSSO({ profile: profileFromEnv });
};
