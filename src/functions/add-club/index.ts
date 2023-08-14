import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  environment: {
    COGNITO_USER_POOL_ID: {
      Ref: "CognitoUserPool",
    },
  },
  iamRoleStatements: [
    {
      Effect: "Allow",
      Action: [
        "cognito-idp:AdminGetUser",
        "cognito-idp:AdminCreateUser",
        "cognito-idp:AdminAddUserToGroup",
        "cognito-idp:AdminUpdateUserAttributes",
      ],
      Resource: {
        "Fn::GetAtt": ["CognitoUserPool", "Arn"],
      },
    },
  ],
};
