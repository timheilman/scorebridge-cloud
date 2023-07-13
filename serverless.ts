import type { AWS } from "@serverless/typescript";

// import hello from '@functions/hello';
import confirmUserSignup from "@functions/confirm-user-signup";
import exampleLambdaDataSource from "@functions/example-lambda-data-source";
import addClub from "@functions/add-club";
import appSync from "./serverless.appsync";
import DynamoDbTables from "./serverless.dynamodb";
import CognitoResources from "./serverless.cognito";

const serverlessConfiguration: AWS & {
  appSync: unknown;
} = {
  org: "theilman",
  app: "scorebridge-backend-app",
  service: "scorebridge-backend-service",
  frameworkVersion: "3",
  plugins: [
    "serverless-esbuild",
    "serverless-appsync-plugin",
    "serverless-iam-roles-per-function",
    "serverless-export-env",
  ],
  provider: {
    name: "aws",
    region: "us-west-2",
    runtime: "nodejs18.x",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      STAGE: `\${sls:stage}`,
    },
  },
  // import the function via paths
  functions: { confirmUserSignup, exampleLambdaDataSource, addClub },
  package: {
    individually: true,
    exclude: ["package-lock.json", "package.json"],
  },
  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node18",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
    },
    settings: {
      COGNITO_USER_POOL_NAME: `ScoreBridgeCognitoUserPool-\${sls:stage}`,
    },
  },
  resources: {
    Resources: {
      ...CognitoResources,
      ...DynamoDbTables,
      AddClubApiKey: {
        Type: "AWS::AppSync::ApiKey",
        Properties: {
          ApiId: {
            "Fn::GetAtt": ["GraphQlApi", "ApiId"],
          },
          Description: `AppSync API key for stage \${sls:stage} for adding new clubs`,
        },
      },
    },
    Outputs: {
      CognitoUserPoolId: {
        Value: {
          Ref: "CognitoUserPool",
        },
      },

      AwsRegion: { Value: `\${aws:region}` },

      WebCognitoUserPoolClientId: {
        Value: {
          Ref: "WebUserPoolClient",
        },
      },
      AddClubApiKey: {
        Value: {
          "Fn::GetAtt": ["AddClubApiKey", "ApiKey"],
        },
      },
    },
  },
  appSync,
};

module.exports = serverlessConfiguration;
