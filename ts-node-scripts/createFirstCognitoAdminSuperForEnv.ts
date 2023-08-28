import { logFn } from "@libs/logging";
import { config as dotenvConfig } from "dotenv";

import {
  cognitoAddUserToGroup,
  cognitoCreateUser,
  ddbCreateUser,
} from "../src/functions/./create-club/handler";
const log = logFn("ts-node-scripts.createFirstCognitoAdminSuperForEnv.");

dotenvConfig();

async function createFirstCognitoAdminSuperForEnv(
  email: string,
): Promise<void> {
  const createUserResult = await cognitoCreateUser(email, undefined);
  const userId = createUserResult.User.Username;
  await Promise.all([
    cognitoAddUserToGroup(userId, "adminSuper"),
    ddbCreateUser(userId, email),
  ]);
  log("createFirstCognitoAdminSuperForEnv.success", "info");
}

const email = process.argv[2];

if (!email) {
  log("emailNotPresent", "error", {
    message: "Please provide the email as a command-line argument.",
  });
  process.exit(1);
}
createFirstCognitoAdminSuperForEnv(email)
  .then(() => log("createFirstCognitoAdminSuperForEnv.success", "info"))
  .catch((e) => log("createFirstCognitoAdminSuperForEnv.error", "error", e));
