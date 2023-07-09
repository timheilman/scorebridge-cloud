// eslint-disable-next-line import/no-extraneous-dependencies
import {
  AdminCreateUserCommand,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
// eslint-disable-next-line import/no-extraneous-dependencies
import { config as dotenvConfig } from "dotenv";
// eslint-disable-next-line import/no-unresolved,import/extensions
import createCognitoIdentityProviderClient from "./createCognitoIdentityProviderClient";
// eslint-disable-next-line import/no-unresolved,import/extensions
import requiredEnvVar from "./requiredEnvVar";

dotenvConfig();

async function adminCreateUser(
  email: string,
  client: CognitoIdentityProviderClient
) {
  const createUserParams = {
    UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
    Username: email,
    UserAttributes: [{ Name: "email", Value: email }],
  };

  const createUserCommand = new AdminCreateUserCommand(createUserParams);
  await client.send(createUserCommand);
}

async function updateUserCustomAttr(
  email: string,
  attr: string,
  val: string,
  client: CognitoIdentityProviderClient
) {
  const updateAttributesParams = {
    UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"), // Use the COGNITO_USER_POOL_ID environment variable
    Username: email,
    UserAttributes: [
      { Name: `custom:${attr}`, Value: val },
      // Add any additional custom attributes here if needed
    ],
  };

  const updateAttributesCommand = new AdminUpdateUserAttributesCommand(
    updateAttributesParams
  );
  await client.send(updateAttributesCommand);
}

async function createFirstCognitoAdminSuperForEnv(
  email: string
): Promise<void> {
  const client = createCognitoIdentityProviderClient();

  try {
    await adminCreateUser(email, client);
  } catch (error) {
    console.error("Error creating user:", error);
    return;
  }
  try {
    await updateUserCustomAttr(email, "role", "adminSuper", client);
  } catch (error) {
    console.error("Error creating user:", error);
  }
  console.log("User with role adminSuper created successfully.");
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
