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
    STAGE: `\${sls:stage}`,
  },
  iamRoleStatementsName: `createClubIamRoleStmts-\${sls:stage}`,
  iamRoleStatements: [
    {
      Effect: "Allow",
      Action: "secretsmanager:GetSecretValue",
      Resource: {
        "Fn::GetAtt": ["Recaptcha2Secret", "Id"],
      },
    },
    {
      Effect: "Allow",
      Action: "dynamodb:PutItem",
      Resource: {
        "Fn::GetAtt": ["UsersTable", "Arn"],
      },
    },
    {
      Effect: "Allow",
      Action: ["dynamodb:PutItem", "dynamoDb:UpdateItem"],
      Resource: {
        "Fn::GetAtt": ["ClubsTable", "Arn"],
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
