import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  environment: {
    USERS_TABLE: {
      Ref: "UsersTable",
    },
    CLUBS_TABLE: {
      Ref: "ClubsTable",
    },
    COGNITO_USER_POOL_ID: {
      Ref: "CognitoUserPool",
    },
  },
  iamRoleStatementsName: `removeClubAndAdminIamRoleStmts-\${sls:stage}`,
  iamRoleStatements: [
    {
      Effect: "Allow",
      Action: "dynamodb:DeleteItem",
      Resource: {
        "Fn::GetAtt": ["UsersTable", "Arn"],
      },
    },
    {
      Effect: "Allow",
      Action: "dynamodb:DeleteItem",
      Resource: {
        "Fn::GetAtt": ["ClubsTable", "Arn"],
      },
    },
    {
      Effect: "Allow",
      Action: "cognito-idp:AdminDeleteUser",
      Resource: {
        "Fn::GetAtt": ["CognitoUserPool", "Arn"],
      },
    },
  ],
};
