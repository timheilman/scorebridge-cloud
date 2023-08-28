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
  iamRoleStatementsName: `createClubIamRoleStmts-\${sls:stage}`,
  iamRoleStatements: [
    {
      Effect: "Allow",
      Action: "dynamodb:PutItem",
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
      ],
      Resource: {
        "Fn::GetAtt": ["CognitoUserPool", "Arn"],
      },
    },
  ],
};
