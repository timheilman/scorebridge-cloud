import requiredEnvVar from "../../libs/requiredEnvVar";

// eslint-disable-next-line import/prefer-default-export,no-unused-vars
export async function main(event) {
  return `Hello World!  region: ${requiredEnvVar(
    "AWS_REGION"
  )}, args: ${JSON.stringify(event.arguments)}`;
}
