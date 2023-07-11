import { AWS } from "@serverless/typescript";
// import { AppSyncConfig } from "serverless-appsync-plugin/src/types/plugin"

// It seems the types for the custom appsync config are not provided by the serverless-appsync-plugin
// at the time of writing, they seem to be defined here:
// https://github.com/sid88in/serverless-appsync-plugin/blob/05164d8847a554d56bb73590fdc35bf0bda5198e/src/types/plugin.ts#L3

const withTemplateFiles = (endpointType, endpointName, otherRecords) => ({
  request: `src/mapping-templates/${endpointType}.${endpointName}.request.vtl`,
  response: `src/mapping-templates/${endpointType}.${endpointName}.response.vtl`,
  ...otherRecords,
});

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
    exampleLambdaDataSource: {
      type: "AWS_LAMBDA",
      config: {
        functionName: "exampleLambdaDataSource",
      },
    },
  },
  resolvers: {
    // [['Query', 'getMyProfile']].reduce((typeName) => {
    //   const type = typeName[0];
    //   const name = typeName[1];
    //   `${typeName[0]}.${typeName[1]}`
    // })
    "Query.getMyProfile": withTemplateFiles("Query", "getMyProfile", {
      kind: "UNIT",
      dataSource: "usersTable",
    }),
    "Query.exampleLambdaDataSource": withTemplateFiles(
      "Query",
      "exampleLambdaDataSource",
      {
        kind: "UNIT",
        dataSource: "exampleLambdaDataSource",
      }
    ),
    "Mutation.editMyProfile": withTemplateFiles("Mutation", "editMyProfile", {
      kind: "UNIT",
      dataSource: "usersTable",
    }),
  },
  pipelineFunctions: {},
};

export default appsyncApi;
