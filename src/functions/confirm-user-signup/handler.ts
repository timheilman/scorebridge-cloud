import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import Chance from "chance";
import { fromEnv } from "@aws-sdk/credential-providers";
import { PostConfirmationTriggerEvent } from "aws-lambda";
import { fromSsoUsingProfileFromEnv } from "../../libs/from-sso-using-profile-from-env";

const chance = new Chance();

// eslint-disable-next-line import/prefer-default-export
export const main = async (event: PostConfirmationTriggerEvent) => {
  const { USERS_TABLE } = process.env;
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
    credentials:
      process.env.NODE_ENV === "test"
        ? fromSsoUsingProfileFromEnv()
        : fromEnv(),
  });
  const command = new PutItemCommand({
    TableName: USERS_TABLE,
    Item: user,
    ConditionExpression: "attribute_not_exists(id)",
  });
  await client.send(command);

  return event;
};
