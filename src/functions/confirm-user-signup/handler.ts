import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { PostConfirmationTriggerEvent } from "aws-lambda/trigger/cognito-user-pool-trigger";
import Chance from "chance";
import { fromEnv } from "@aws-sdk/credential-providers";

const chance = new Chance();
const { USERS_TABLE } = process.env;

// eslint-disable-next-line import/prefer-default-export
export const main = async (event: PostConfirmationTriggerEvent) => {
  if (event.triggerSource !== "PostConfirmation_ConfirmSignUp") {
    return event;
  }
  const { name } = event.request.userAttributes;
  const suffix = chance.string({
    length: 8,
    casing: "upper",
    alpha: true,
    numeric: true,
  });
  const screenName = `${name.replace(/[^a-zA-Z0-9]/g, "")}${suffix}`;
  const user = {
    id: { S: event.userName },
    name: { S: name },
    screenName: { S: screenName },
    createdAt: { S: new Date().toJSON() },
  };
  const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "NO_REGION_FOUND_IN_ENV",
    credentials: fromEnv(),
  });
  const command = new PutItemCommand({
    TableName: USERS_TABLE,
    Item: user,
    ConditionExpression: "attribute_not_exists(id)",
  });
  await client.send(command);

  return event;
};
