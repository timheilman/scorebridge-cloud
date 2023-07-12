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
    SELF_SIGN_UP_COGNITO_USER_POOL_CLIENT_ID: {
      Ref: "SelfSignUpUserPoolClient",
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
