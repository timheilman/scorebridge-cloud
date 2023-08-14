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
  ],
};
