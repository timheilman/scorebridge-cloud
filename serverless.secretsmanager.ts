export default {
  Recaptcha2Secret: {
    Type: "AWS::SecretsManager::Secret",
    Properties: {
      Name: `\${sls:stage}.recaptcha2Secret`,
      SecretString: JSON.stringify({
        password: "SET ME FROM API KEY REGISTRATION WITH GOOGLE CLOUD",
      }),
      Description:
        "secret for the recaptcha service offered by Google to protect signup",
    },
  },
};
