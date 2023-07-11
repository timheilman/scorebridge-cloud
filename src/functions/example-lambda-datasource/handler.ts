import requiredEnvVar from "../../libs/requiredEnvVar";

// eslint-disable-next-line import/prefer-default-export,no-unused-vars
export async function main(event) {
  console.log(
    `Hello World!  region: ${requiredEnvVar(
      "AWS_REGION"
    )}, args: ${JSON.stringify(event.arguments)}`
  );
  console.log(JSON.stringify(event, null, 2));
  return event;
}
