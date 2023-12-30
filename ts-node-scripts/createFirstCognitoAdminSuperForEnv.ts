import { logFn } from "@libs/logging";
import { config as dotenvConfig } from "dotenv";

import { ddbCreateUser } from "../src/functions/./create-club/handler";
import { cognitoAddUserToGroup, cognitoCreateUser } from "../src/libs/cognito";

const log = logFn("ts-node-scripts.createFirstCognitoAdminSuperForEnv.");

dotenvConfig();

async function createFirstCognitoAdminSuperForEnv(
  email: string,
): Promise<void> {
  const userId = await cognitoCreateUser(email, undefined);
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
