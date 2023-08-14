import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminCreateUserCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import { cachedCognitoIdpClient } from "@libs/cognito";
import { config as dotenvConfig } from "dotenv";

import requiredEnvVar from "../src/libs/requiredEnvVar";
import createCognitoIdentityProviderClient from "./createCognitoIdentityProviderClient";

dotenvConfig();

async function createFirstCognitoAdminSuperForEnv(
  email: string,
): Promise<void> {
  const client = createCognitoIdentityProviderClient();
  let createUserResult: AdminCreateUserCommandOutput;
  try {
    const createUserParams = {
      UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
      Username: email,
      UserAttributes: [{ Name: "email", Value: email }],
    };

    const createUserCommand = new AdminCreateUserCommand(createUserParams);
    createUserResult = await client.send(createUserCommand);
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
  try {
    const params = {
      GroupName: "adminSuper",
      UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
      Username: createUserResult.User.Username, // note: email also works here
    };
    const command = new AdminAddUserToGroupCommand(params);
    await cachedCognitoIdpClient().send(command);
    console.log("User added to the adminSuper group successfully");
  } catch (error) {
    console.error("Error adding user to adminSuper group:", error);
    throw error;
  }
  console.log("Cognito user created successfully.");
}

// Retrieve the email and club slug from command-line arguments
const email = process.argv[2];

// Check if both email and club slug are provided as command-line arguments
if (!email) {
  console.error("Please provide the email as a command-line argument.");
  process.exit(1);
}
createFirstCognitoAdminSuperForEnv(email)
  .then(() => console.log("done"))
  .catch((e) => console.error("problem", e));
