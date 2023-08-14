import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { logCompletionDecorator as lcd } from "@libs/log-completion-decorator";
import requiredEnvVar from "@libs/requiredEnvVar";
import { PostConfirmationTriggerEvent } from "aws-lambda";

import { cachedDynamoDbClient } from "../../libs/ddb";

async function ddbCreateUser(userId: string, email: string) {
  const user = marshall({
    id: userId,
    email,
    createdAt: new Date().toJSON(),
  });
  const ddbCreateCommandUser = new PutItemCommand({
    TableName: requiredEnvVar("USERS_TABLE"),
    Item: user,
    ConditionExpression: "attribute_not_exists(id)",
  });
  return cachedDynamoDbClient().send(ddbCreateCommandUser);
}
async function ddbCreateClub(clubId: string, clubName: string) {
  const user = marshall({
    id: clubId,
    name: clubName,
    createdAt: new Date().toJSON(),
  });
  const ddbCreateCommandClub = new PutItemCommand({
    TableName: requiredEnvVar("CLUBS_TABLE"),
    Item: user,
    ConditionExpression: "attribute_not_exists(id)",
  });
  return cachedDynamoDbClient().send(ddbCreateCommandClub);
}

export const main = async (event: PostConfirmationTriggerEvent) => {
  console.log(`confirm-user-signup done been called`);
  if (event.triggerSource !== "PostConfirmation_ConfirmSignUp") {
    return event;
  }
  const email = event.request.userAttributes["email"];
  const tenantId = event.request.userAttributes["custom:tenantId"];
  const clubName = event.request.userAttributes["custom:initialClubName"];
  await Promise.all([
    lcd(ddbCreateUser(event.userName, email), "Done creating user"),
    lcd(ddbCreateClub(tenantId, clubName), "Done creating club"),
  ]);
  return event;
};
