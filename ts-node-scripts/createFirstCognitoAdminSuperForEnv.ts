// eslint-disable-next-line import/no-extraneous-dependencies
import { AdminCreateUserCommand } from "@aws-sdk/client-cognito-identity-provider";
// eslint-disable-next-line import/no-extraneous-dependencies
import { config as dotenvConfig } from "dotenv";
// eslint-disable-next-line import/no-unresolved,import/extensions
import createCognitoIdentityProviderClient from "./createCognitoIdentityProviderClient";
// eslint-disable-next-line import/no-unresolved,import/extensions
import requiredEnvVar from "./requiredEnvVar";

dotenvConfig();

async function createFirstCognitoAdminSuperForEnv(
  email: string
): Promise<void> {
  const client = createCognitoIdentityProviderClient();

  try {
    const createUserParams = {
      UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
      Username: email,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "custom:role", Value: "adminSuper" },
      ],
    };

    const createUserCommand = new AdminCreateUserCommand(createUserParams);
    await client.send(createUserCommand);
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
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
