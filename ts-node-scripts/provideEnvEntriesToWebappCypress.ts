import dotenv from "dotenv";
dotenv.config();

const req = (s: string) => {
  if (!process.env[s]) {
    throw new Error(`Expected ${s} to be set in the env already!`);
  }
  return process.env[s];
};

// console.log(JSON.stringify({
console.log(
  JSON.stringify(
    [
      "AWS_REGION",
      "COGNITO_USER_POOL_ID",
      "USERS_TABLE",
      "CLUBS_TABLE",
      "STAGE",
      "PORTAL_URL",
      "SB_TEST_AWS_CLI_PROFILE",
      "COGNITO_USER_POOL_CLIENT_ID_WEB",
      "SES_SANDBOX_SQS_QUEUE_URL",
    ].reduce((acc, v) => {
      acc[v] = req(v);
      return acc;
    }, {}),
    null,
    2,
  ),
);

// (webappDependentVar) => `"${webappDependentVar}": "${process.env[webappDependentVar]}"`)}, null, 2)
