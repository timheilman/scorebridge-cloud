import {
  cognitoAddUserToGroup,
  cognitoCreateUser,
} from "@functions/add-club/handler";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

async function createFirstCognitoAdminSuperForEnv(
  email: string,
): Promise<void> {
  const createUserResult = await cognitoCreateUser(email, undefined);
  await cognitoAddUserToGroup(createUserResult.User.Username, "adminSuper");
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
