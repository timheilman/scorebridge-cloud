import { AppSyncResolverEvent } from "aws-lambda";
import { AppSyncResolverHandler } from "aws-lambda/trigger/appsync-resolver";
import { ulid } from "ulid";
import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminUpdateUserAttributesCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import requiredEnvVar from "@libs/requiredEnvVar";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { cachedCognitoIdpClient } from "@libs/cognito";
import { cachedDynamoDbClient } from "@libs/ddb";
import { AddClubResponse, MutationAddClubArgs } from "../../../appsync";

async function createCognitoUser(
  email: string,
  suppressInvitationEmail: boolean
) {
  try {
    // Because there is a quota on the number of emails we may send using cognito, but
    // it is far beyond anything expected in production, we suppress emails when testing
    const emailAction = suppressInvitationEmail
      ? { MessageAction: "SUPPRESS" }
      : {};
    const createUserParams = {
      UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
      Username: email,
      UserAttributes: [{ Name: "email", Value: email }],
      ...emailAction,
    };

    const createUserCommand = new AdminCreateUserCommand(createUserParams);
    return await cachedCognitoIdpClient().send(createUserCommand);
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// eslint-disable-next-line import/prefer-default-export
export const main: AppSyncResolverHandler<
  MutationAddClubArgs,
  AddClubResponse
> = async (
  event: AppSyncResolverEvent<MutationAddClubArgs>
): Promise<AddClubResponse> => {
  const email = event.arguments.input.newAdminEmail;
  const clubName = event.arguments.input.newClubName;
  const clubId = ulid();
  // cognito: create the user; suppress email only for testing
  const createdUser = await createCognitoUser(
    email,
    event.arguments.input.suppressInvitationEmail
  );
  const userId = createdUser.User.Username;
  // cognito: set user's clubId to synthetic id for the club
  try {
    const updateUserParams: AdminUpdateUserAttributesCommandInput = {
      UserAttributes: [{ Name: "custom:tenantId", Value: clubId }],
      UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
      Username: userId, // note: email also works here!
    };
    const updateUserCommand = new AdminUpdateUserAttributesCommand(
      updateUserParams
    );
    await cachedCognitoIdpClient().send(updateUserCommand);
  } catch (error) {
    console.error("Error updating user to adminClub role:", error);
    throw error;
  }
  console.log("Cognito user created successfully.");
  // cognito: add the user to the adminClub group
  // Prepare the parameters for the AdminAddUserToGroupCommand

  // Add the user to the group
  try {
    const params = {
      GroupName: "adminClub",
      UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
      Username: userId, // note: email also works here
    };
    const command = new AdminAddUserToGroupCommand(params);
    await cachedCognitoIdpClient().send(command);
    console.log("User added to the adminClub group successfully");
  } catch (error) {
    console.error("Error adding user to the adminClub group:", error);
  }
  try {
    const user = marshall({
      id: userId,
      email,
      createdAt: new Date().toJSON(),
    });

    const createUserDdbCommand = new PutItemCommand({
      TableName: requiredEnvVar("USERS_TABLE"),
      Item: user,
      ConditionExpression: "attribute_not_exists(id)",
    });
    await cachedDynamoDbClient().send(createUserDdbCommand);
  } catch (error) {
    console.error("Error creating ddb user", error);
    throw error;
  }
  console.log("Ddb user created successfully.");

  try {
    const club = marshall({
      id: clubId,
      name: clubName,
      createdAt: new Date().toJSON(),
    });
    const createClubDdbCommand = new PutItemCommand({
      TableName: requiredEnvVar("CLUBS_TABLE"),
      Item: club,
      ConditionExpression: "attribute_not_exists(id)",
    });
    await cachedDynamoDbClient().send(createClubDdbCommand);
  } catch (error) {
    console.error("Error creating ddb club", error);
    throw error;
  }
  console.log("Ddb club created successfully.");

  return {
    newUserId: userId,
    newClubId: clubId,
  };
};
