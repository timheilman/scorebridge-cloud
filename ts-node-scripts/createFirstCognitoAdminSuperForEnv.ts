import {
  AdminCreateUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminUpdateUserAttributesCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import { config as dotenvConfig } from "dotenv";
import createCognitoIdentityProviderClient from "./createCognitoIdentityProviderClient";
import requiredEnvVar from "../src/libs/requiredEnvVar";

dotenvConfig();

async function createFirstCognitoAdminSuperForEnv(
  email: string,
): Promise<void> {
  const client = createCognitoIdentityProviderClient();

  try {
    const createUserParams = {
      UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
      Username: email,
      UserAttributes: [{ Name: "email", Value: email }],
    };

    const createUserCommand = new AdminCreateUserCommand(createUserParams);
    await client.send(createUserCommand);
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
  try {
    const updateUserParams: AdminUpdateUserAttributesCommandInput = {
      UserAttributes: [{ Name: "custom:role", Value: "adminSuper" }],
      UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
      Username: email,
    };
    const updateUserCommand = new AdminUpdateUserAttributesCommand(
      updateUserParams,
    );
    await client.send(updateUserCommand);
  } catch (error) {
    console.error("Error updating user to adminSuper role:", error);
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
