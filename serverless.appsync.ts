import { AWS } from "@serverless/typescript";
// import { AppSyncConfig } from "serverless-appsync-plugin/src/types/plugin"

// It seems the types for the custom appsync config are not provided by the serverless-appsync-plugin
// at the time of writing, they seem to be defined here:
// https://github.com/sid88in/serverless-appsync-plugin/blob/05164d8847a554d56bb73590fdc35bf0bda5198e/src/types/plugin.ts#L3
type EndpointType = "Query" | "Mutation";

type DdbResolver = {
  endpointType: EndpointType;
  endpointName: string;
  dataSource: string;
};

// const ddr = (
//   endpointType: EndpointType,
//   endpointName: string,
//   dataSource: string,
// ): DdbResolver => ({ endpointType, endpointName, dataSource });

type LambdaResolver = {
  endpointType: "Query" | "Mutation";
  endpointNameAndDataSource: string;
};

const lr = (
  endpointType: EndpointType,
  endpointNameAndDataSource: string,
): LambdaResolver => ({
  endpointType,
  endpointNameAndDataSource,
});

const ddbResolvers: DdbResolver[] = [
  // ddr("Query", "getMyProfile", "usersTable"),
  // ddr("Mutation", "editMyProfile", "usersTable"),
];

// Unlike DynamoDb resolvers, lambdas always have a datasource named the same
const lambdaResolvers = [
  lr("Query", "exampleLambdaDataSource"),
  lr("Mutation", "createClub"),
  lr("Mutation", "deleteClubAndAdmin"),
  lr("Mutation", "unexpectedError"),
];

// Derived:
const ddbDataSources = [...new Set(ddbResolvers.map((v) => v.dataSource))];

const resolverDefnUnitVtl = (d: DdbResolver) => ({
  request: `src/mapping-templates/${d.endpointType}.${d.endpointName}.request.vtl`,
  response: `src/mapping-templates/${d.endpointType}.${d.endpointName}.response.vtl`,
  kind: "UNIT",
  dataSource: d.dataSource,
});

const fnDefnPipelineJs = (l: LambdaResolver) => {
  return {
    dataSource: l.endpointNameAndDataSource,
    code: `src/mapping-templates-js/${l.endpointType}.${l.endpointNameAndDataSource}.js`,
    kind: "PIPELINE",
  };
};

const resolverDefnPipelineVtl = (pipelineFnName: string) => ({
  functions: [pipelineFnName],
});

// const resolverDefnJs = (
//   endpointType: string,
//   endpointName: string,
//   dataSource: string,
// ) => ({
//   functions:
//   code: `/Users/tdh/repos/scorebridge-cloud/src/mapping-templates-js/${endpointType}.${endpointName}.js`,
//   dataSource,
// });

function customAppSyncLambdaDataSources() {
  return lambdaResolvers.reduce((acc, lr) => {
    acc[lr.endpointNameAndDataSource] = {
      type: "AWS_LAMBDA",
      config: { functionName: lr.endpointNameAndDataSource },
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

function pipelineFnName(l: LambdaResolver) {
  return `Pfn${l.endpointType}${l.endpointNameAndDataSource}`;
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
  resolvers: {
    ...ddbResolvers.reduce((acc, dr) => {
      acc[`${dr.endpointType}.${dr.endpointName}`] = resolverDefnUnitVtl(dr);
      return acc;
    }, {}),
    ...lambdaResolvers.reduce((acc, lr) => {
      acc[`${lr.endpointType}.${lr.endpointNameAndDataSource}`] =
        resolverDefnPipelineVtl(pipelineFnName(lr));
      return acc;
    }, {}),
  },
  pipelineFunctions: {
    ...lambdaResolvers.reduce((acc, lr) => {
      acc[pipelineFnName(lr)] = fnDefnPipelineJs(lr);
      return acc;
    }, {}),
  },
};

export default appsyncApi;

export const AdditionalAppSyncResources = {
  CreateClubApiKey: {
    Type: "AWS::AppSync::ApiKey",
    Properties: {
      ApiId: {
        "Fn::GetAtt": ["GraphQlApi", "ApiId"],
      },
      Description: `AppSync API key for stage \${sls:stage} for creating new clubs`,
      Expires: `\${env:CREATE_USER_API_KEY_EXPIRES_EPOCH_SEC}`,
    },
  },
};
