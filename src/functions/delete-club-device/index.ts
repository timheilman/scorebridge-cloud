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
  },
  iamRoleStatementsName: `deleteClubDeviceIamRoleStmts-\${sls:stage}`,
  iamRoleStatements: [
    {
      Effect: "Allow",
      Action: "dynamodb:DeleteItem",
      Resource: {
        "Fn::GetAtt": ["ClubDevicesTable", "Arn"],
      },
    },
    {
      Effect: "Allow",
      Action: ["cognito-idp:AdminDeleteUser"],
      Resource: {
        "Fn::GetAtt": ["CognitoUserPool", "Arn"],
      },
    },
  ],
};
