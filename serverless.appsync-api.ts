import { AWS } from "@serverless/typescript";
// import { AppSyncConfig } from "serverless-appsync-plugin/src/types/plugin"

// It seems the types for the custom appsync config are not provided by the serverless-appsync-plugin
// at the time of writing, they seem to be defined here:
// https://github.com/sid88in/serverless-appsync-plugin/blob/05164d8847a554d56bb73590fdc35bf0bda5198e/src/types/plugin.ts#L3

const resolvers = [
  "Query.getMyProfile.usersTable",
  "Query.exampleLambdaDataSource.exampleLambdaDataSource",
  "Mutation.editMyProfile.usersTable",
  "Mutation.addClub.addClub",
];

const lambdaDataSources = ["exampleLambdaDataSource", "addClub"];

const withTemplateFiles = (endpointType, endpointName, dataSource) => ({
  request: `src/mapping-templates/${endpointType}.${endpointName}.request.vtl`,
  response: `src/mapping-templates/${endpointType}.${endpointName}.response.vtl`,
  kind: "UNIT",
  dataSource,
});

function customAppSyncResolvers() {
  return resolvers.reduce((acc, val) => {
    const s = val.split(".");
    const type = s[0];
    const name = s[1];
    const dataSource = s[2];
    acc[`${type}.${name}`] = withTemplateFiles(type, name, dataSource);
    return acc;
  }, {});
}

function customAppSyncLambdaDataSources() {
  return lambdaDataSources.reduce((acc, val) => {
    acc[val] = {
      type: "AWS_LAMBDA",
      config: { functionName: val },
    };
    return acc;
  }, {});
}

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
  additionalAuthentications: [{ type: "API_KEY" }],
  dataSources: {
    usersTable: {
      type: "AMAZON_DYNAMODB",
      config: {
        tableName: { Ref: "UsersTable" },
      },
    },
    ...customAppSyncLambdaDataSources(),
  },
  resolvers: customAppSyncResolvers(),
  pipelineFunctions: {},
};

export default appsyncApi;
