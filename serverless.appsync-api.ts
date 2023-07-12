import { AWS } from "@serverless/typescript";
// import { AppSyncConfig } from "serverless-appsync-plugin/src/types/plugin"

// It seems the types for the custom appsync config are not provided by the serverless-appsync-plugin
// at the time of writing, they seem to be defined here:
// https://github.com/sid88in/serverless-appsync-plugin/blob/05164d8847a554d56bb73590fdc35bf0bda5198e/src/types/plugin.ts#L3

const ddbResolvers = [
  ["Query", "getMyProfile", "usersTable"],
  ["Mutation", "editMyProfile", "usersTable"],
];

// Unlike DynamoDb resolvers, lambdas always have a datasource named the same
const lambdaResolvers = [
  ["Query", "exampleLambdaDataSource"],
  ["Mutation", "addClub"],
];

// Derived:
const ddbDataSources = [...new Set(ddbResolvers.map((v) => v[2]))];

const resolverDefinition = (endpointType, endpointName, dataSource) => ({
  request: `src/mapping-templates/${endpointType}.${endpointName}.request.vtl`,
  response: `src/mapping-templates/${endpointType}.${endpointName}.response.vtl`,
  kind: "UNIT",
  dataSource,
});

function customAppSyncResolvers() {
  return {
    ...ddbResolvers.reduce((acc, val) => {
      acc[`${val[0]}.${val[1]}`] = resolverDefinition(val[0], val[1], val[2]);
      return acc;
    }, {}),
    ...lambdaResolvers.reduce((acc, val) => {
      acc[`${val[0]}.${val[1]}`] = resolverDefinition(
        val[0],
        val[1],
        val[1] /* lambdas always get their own same-named datasource */
      );
      return acc;
    }, {}),
  };
}

function customAppSyncLambdaDataSources() {
  return lambdaResolvers.reduce((acc, val) => {
    acc[val[1]] = {
      type: "AWS_LAMBDA",
      config: { functionName: val[1] },
    };
    return acc;
  }, {});
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// patches appSync data sources through to ddb tables of same name
function customAppSyncDdbDataSources() {
  return ddbDataSources.reduce((acc, val) => {
    acc[val] = {
      type: "AMAZON_DYNAMODB",
      config: { tableName: { Ref: capitalizeFirstLetter(val) } },
    };
    return acc;
  }, {});
}

function customAppSyncDataSources() {
  return {
    ...customAppSyncDdbDataSources(),
    ...customAppSyncLambdaDataSources(),
  };
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
  dataSources: customAppSyncDataSources(),
  resolvers: customAppSyncResolvers(),
  pipelineFunctions: {},
};

export default appsyncApi;
