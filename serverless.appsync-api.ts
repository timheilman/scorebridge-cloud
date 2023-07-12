import { AWS } from "@serverless/typescript";
// import { AppSyncConfig } from "serverless-appsync-plugin/src/types/plugin"

// It seems the types for the custom appsync config are not provided by the serverless-appsync-plugin
// at the time of writing, they seem to be defined here:
// https://github.com/sid88in/serverless-appsync-plugin/blob/05164d8847a554d56bb73590fdc35bf0bda5198e/src/types/plugin.ts#L3

// TODO: make this ddbResolvers and lambdaResolvers; treat separately
// in order to dry the dataSource name and lambda fn name: always the same
const ddbResolvers = [
  "Query.getMyProfile.usersTable",
  "Mutation.editMyProfile.usersTable",
];

const lambdaResolvers = [
  // "Query.exampleLambdaDataSource", // see below, just verifying old format
  "Mutation.addClub",
];

const withTemplateFiles = (endpointType, endpointName, dataSource) => ({
  request: `src/mapping-templates/${endpointType}.${endpointName}.request.vtl`,
  response: `src/mapping-templates/${endpointType}.${endpointName}.response.vtl`,
  kind: "UNIT",
  dataSource,
});

function customAppSyncResolvers() {
  return {
    ...ddbResolvers.reduce((acc, val) => {
      const s = val.split(".");
      const type = s[0];
      const name = s[1];
      const dataSource = s[2];
      acc[`${type}.${name}`] = withTemplateFiles(type, name, dataSource);
      return acc;
    }, {}),
    ...lambdaResolvers.reduce((acc, val) => {
      const s = val.split(".");
      const type = s[0];
      const name = s[1];
      acc[`${type}.${name}`] = withTemplateFiles(type, name, name);
      return acc;
    }, {}),
  };
}

function customAppSyncLambdaDataSources() {
  return lambdaResolvers.reduce((acc, val) => {
    const s = val.split(".");
    const name = s[1];
    acc[name] = {
      type: "AWS_LAMBDA",
      config: { functionName: name },
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
    // TODO: oops, refactor out this part: need clubsTable here too!
    usersTable: {
      type: "AMAZON_DYNAMODB",
      config: {
        tableName: { Ref: "UsersTable" },
      },
    },
    ...customAppSyncLambdaDataSources(),
    exampleLambdaDataSource: {
      type: "AWS_LAMBDA",
      config: {
        functionName: { Ref: "exampleLambdaDataSource" },
      },
    },
  },
  resolvers: {
    ...customAppSyncResolvers(),
    // just verifying old event w/false request/response... see above
    "Query.exampleLambdaDataSource": {
      kind: "UNIT",
      dataSource: "exampleLambdaDataSource",
      request: false,
      response: false,
    },
  },
  pipelineFunctions: {},
};

export default appsyncApi;
