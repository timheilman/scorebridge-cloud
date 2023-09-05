import dotenv from "dotenv";
dotenv.config();

function convertToReactActVar(s: string) {
  return `EXPO_PUBLIC_${s}=${process.env[s]}`;
}

[
  "AWS_REGION",
  "COGNITO_USER_POOL_ID",
  "COGNITO_USER_POOL_CLIENT_ID_CLUB_DEVICE",
  "API_URL",
  "PORTAL_URL",
  "STAGE",
].forEach((webappDependentVar) => {
  console.log(convertToReactActVar(webappDependentVar));
});
