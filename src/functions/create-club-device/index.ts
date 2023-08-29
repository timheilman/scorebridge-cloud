import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  environment: {
    CLUB_DEVICES_TABLE: {
      Ref: "ClubDevicesTable",
    },
    COGNITO_USER_POOL_ID: {
      Ref: "CognitoUserPool",
    },
    STAGE: `\${sls:stage}`,
  },
  iamRoleStatementsName: `createClubDeviceIamRoleStmts-\${sls:stage}`,
  iamRoleStatements: [
    {
      Effect: "Allow",
      Action: "dynamodb:UpdateItem",
      Resource: {
        "Fn::GetAtt": ["ClubDevicesTable", "Arn"],
      },
    },
    {
      Effect: "Allow",
      Action: [
        "cognito-idp:AdminGetUser",
        "cognito-idp:AdminCreateUser",
        "cognito-idp:AdminAddUserToGroup",
        "cognito-idp:AdminUpdateUserAttributes",
        "cognito-idp:AdminSetUserPassword",
      ],
      Resource: {
        "Fn::GetAtt": ["CognitoUserPool", "Arn"],
      },
    },
  ],
};
