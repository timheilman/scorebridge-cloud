import { handlerPath } from "@libs/handler-resolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  environment: {
    USERS_TABLE: {
      Ref: "UsersTable",
    },
  },
  iamRoleStatements: [
    {
      Effect: "Allow",
      Action: "dynamodb:PutItem",
      Resource: {
        "Fn::GetAtt": ["UsersTable", "Arn"],
      },
    },
    {
      Effect: "Allow",
      Action: "dynamodb:PutItem",
      Resource: {
        "Fn::GetAtt": ["ClubsTable", "Arn"],
      },
    },
    {
      Effect: "Allow",
      Action: [
        "cognito-idp:AdminCreateUser",
        "cognito-idp:AdminUpdateUserAttributes",
      ],
      Resource: {
        "Fn::GetAtt": ["CognitoUserPool", "Arn"],
      },
    },
  ],
};
