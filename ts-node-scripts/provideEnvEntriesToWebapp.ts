import dotenv from "dotenv";
dotenv.config();

function convertToReactAppVar(s: string) {
  return `REACT_APP_${s}=${process.env[s]}`;
}

[
  "AWS_REGION",
  "CREATE_CLUB_API_KEY",
  "COGNITO_USER_POOL_ID",
  "COGNITO_USER_POOL_CLIENT_ID_WEB",
  "API_URL",
  "STAGE",
].forEach((webappDependentVar) => {
  console.log(convertToReactAppVar(webappDependentVar));
});
// cannot automatically test captcha in prod
if (process.env["STAGE"] !== "prod") {
  // this is the test pass-thru site key
  console.log(
    `REACT_APP_RECAPTCHA2_SITE_KEY=6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI`,
  );
}
