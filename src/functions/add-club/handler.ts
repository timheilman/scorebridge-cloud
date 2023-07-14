import { AppSyncResolverEvent } from "aws-lambda";
import { AppSyncResolverHandler } from "aws-lambda/trigger/appsync-resolver";
import { ulid } from "ulid";
import { fromEnv } from "@aws-sdk/credential-providers";
import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminUpdateUserAttributesCommandInput,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import requiredEnvVar from "@libs/requiredEnvVar";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { AddClubResponse, MutationAddClubArgs } from "../../../appsync";

let cognitoIdpClient;
let dynamoDbClient;

function cachedCognitoIdpClient() {
  if (cognitoIdpClient) {
    return cognitoIdpClient;
  }
  cognitoIdpClient = new CognitoIdentityProviderClient({
    region: requiredEnvVar("AWS_REGION"),
    credentials: fromEnv(),
  });
  return cognitoIdpClient;
}

function cachedDdbClient() {
  if (dynamoDbClient) {
    return dynamoDbClient;
  }
  dynamoDbClient = new DynamoDBClient({
    region: requiredEnvVar("AWS_REGION"),
    credentials: fromEnv(),
  });
  return dynamoDbClient;
}

async function createCognitoUser(email: string) {
  try {
    const createUserParams = {
      UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
      Username: email,
      UserAttributes: [{ Name: "email", Value: email }],
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
  // cognito: create the user; this should send email
  const createdUser = await createCognitoUser(email);
  const userId = createdUser.User.Username;
  // cognito: set user's clubId to synthetic id for the club
  try {
    const updateUserParams: AdminUpdateUserAttributesCommandInput = {
      UserAttributes: [{ Name: "custom:tenantId", Value: clubId }],
      UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
      Username: email, // TODO: wow this works?  try userId instead and see if it works, see below todo
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
      Username: email, // TODO: see above todo
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
    await cachedDdbClient().send(createUserDdbCommand);
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
    await cachedDdbClient().send(createClubDdbCommand);
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
