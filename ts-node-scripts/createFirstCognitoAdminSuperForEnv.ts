import { logFn } from "@libs/logging";
import { config as dotenvConfig } from "dotenv";

import {
  cognitoAddUserToGroup,
  cognitoCreateUser,
} from "../src/functions/add-club/handler";
const log = logFn(__filename);

dotenvConfig();

async function createFirstCognitoAdminSuperForEnv(
  email: string,
): Promise<void> {
  const createUserResult = await cognitoCreateUser(email, undefined);
  await cognitoAddUserToGroup(createUserResult.User.Username, "adminSuper");
  log(".createFirstCognitoAdminSuperForEnv.success", "info");
}

// Retrieve the email and club slug from command-line arguments
const email = process.argv[2];

// Check if both email and club slug are provided as command-line arguments
if (!email) {
  log(".emailNotPresent", "error", {
    message: "Please provide the email as a command-line argument.",
  });
  process.exit(1);
}
createFirstCognitoAdminSuperForEnv(email)
  .then(() => log(".createFirstCognitoAdminSuperForEnv.success", "info"))
  .catch((e) => log(".createFirstCognitoAdminSuperForEnv.error", "error", e));
