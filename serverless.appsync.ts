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
  ["Mutation", "removeClubAndAdmin"],
  ["Mutation", "unexpectedError"],
];

// Derived:
const ddbDataSources = [...new Set(ddbResolvers.map((v) => v[2]))];

const resolverDefinition = (
  endpointType: string,
  endpointName: string,
  dataSource: string,
) => ({
  request: `src/mapping-templates/${endpointType}.${endpointName}.request.vtl`,
  response: `src/mapping-templates/${endpointType}.${endpointName}.response.vtl`,
  kind: "UNIT",
  dataSource,
});

function customAppSyncResolvers() {
  return {
    ...ddbResolvers.reduce((acc, typeNameDs) => {
      acc[`${typeNameDs[0]}.${typeNameDs[1]}`] = resolverDefinition(
        typeNameDs[0],
        typeNameDs[1],
        typeNameDs[2],
      );
      return acc;
    }, {}),
    ...lambdaResolvers.reduce((acc, typeName) => {
      acc[`${typeName[0]}.${typeName[1]}`] = resolverDefinition(
        typeName[0],
        typeName[1],
        typeName[1] /* lambdas always get their own same-named datasource */,
      );
      return acc;
    }, {}),
  };
}

function customAppSyncLambdaDataSources() {
  return lambdaResolvers.reduce((acc, typeAndName) => {
    acc[typeAndName[1]] = {
      type: "AWS_LAMBDA",
      config: { functionName: typeAndName[1] },
    };
    return acc;
  }, {});
}

function capitalizeFirstLetter(string: string) {
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
  name: "scorebridge-cloud",
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

export const AdditionalAppSyncResources = {
  AddClubApiKey: {
    Type: "AWS::AppSync::ApiKey",
    Properties: {
      ApiId: {
        "Fn::GetAtt": ["GraphQlApi", "ApiId"],
      },
      Description: `AppSync API key for stage \${sls:stage} for adding new clubs`,
      Expires: `\${env:ADD_USER_API_KEY_EXPIRES_EPOCH_SEC}`,
    },
  },
};
