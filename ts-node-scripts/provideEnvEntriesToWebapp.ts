import dotenv from "dotenv";
dotenv.config();

function convertToReactActVar(s: string) {
  return `REACT_APP_${s}=${process.env[s]}`;
}

[
  "AWS_REGION",
  "ADD_CLUB_API_KEY",
  "COGNITO_USER_POOL_ID",
  "COGNITO_USER_POOL_CLIENT_ID_WEB",
  "API_URL",
  "STAGE",
].forEach((webappDependentVar) => {
  console.log(convertToReactActVar(webappDependentVar));
});
