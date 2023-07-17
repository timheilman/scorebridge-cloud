import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import Chance from "chance";
import { PostConfirmationTriggerEvent } from "aws-lambda";
import { cachedDynamoDbClient } from "../../libs/ddb";

const chance = new Chance();

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
  const command = new PutItemCommand({
    TableName: USERS_TABLE,
    Item: user,
    ConditionExpression: "attribute_not_exists(id)",
  });
  await cachedDynamoDbClient().send(command);

  return event;
};
