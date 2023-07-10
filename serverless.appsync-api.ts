import { AWS } from "@serverless/typescript";
// import { AppSyncConfig } from "serverless-appsync-plugin/src/types/plugin"

// It seems the types for the custom appsync config are not provided by the serverless-appsync-plugin
// at the time of writing, they seem to be defined here:
// https://github.com/sid88in/serverless-appsync-plugin/blob/05164d8847a554d56bb73590fdc35bf0bda5198e/src/types/plugin.ts#L3

const appsyncApi: AWS["custom"]["appSync"] /* : AppSyncConfig */ = {
  name: "ScoreBridge-backend",
  schema: "schema.api.graphql",
  authentication: {
    type: "AMAZON_COGNITO_USER_POOLS",
    config: {
      awsRegion: "us-west-2",
      userPoolId: {
        Ref: "CognitoUserPool",
      },
      defaultAction: "ALLOW",
    },
  },
  additionalAuthentications: [],
  dataSources: {
    usersTable: {
      type: "AMAZON_DYNAMODB",
      config: {
        tableName: { Ref: "UsersTable" },
      },
    },
  },
  resolvers: {
    "Query.getMyProfile": {
      kind: "UNIT",
      dataSource: "usersTable",
      request: "src/mapping-templates/Query.getMyProfile.request.vtl",
      response: "src/mapping-templates/Query.getMyProfile.response.vtl",
    },
    "Mutation.editMyProfile": {
      kind: "UNIT",
      dataSource: "usersTable",
      request: "src/mapping-templates/Mutation.editMyProfile.request.vtl",
      response: "src/mapping-templates/Mutation.editMyProfile.response.vtl",
    },
  },
  pipelineFunctions: {},
};

export default appsyncApi;
