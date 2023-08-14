// import hello from '@functions/hello';
import allFunctions from "@functions/all";
import type { AWS } from "@serverless/typescript";

import appSync from "./serverless.appsync";
import { AdditionalAppSyncResources } from "./serverless.appsync";
import CognitoResources from "./serverless.cognito";
import DynamoDbTables from "./serverless.dynamodb";
import SesResources from "./serverless.ses";
import SnsResources from "./serverless.sns";
import SqsResources from "./serverless.sqs";

const serverlessConfiguration: AWS & {
  appSync: unknown;
} = {
  org: "theilman",
  app: "scorebridge-cloud-app",
  service: "scorebridge-cloud-service",
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
  },
  functions: allFunctions,
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
      awsAcctId: {
        dev: "437893194722",
        staging: "655935885730",
        prod: "515279954553",
      },
      sesFromAddress: {
        dev: "scorebridge8+dev@gmail.com",
        staging: "scorebridge8+staging@gmail.com",
        prod: "scorebridge8@gmail.com",
      },
      AWS_ACCOUNT_ID: `\${self:custom.settings.awsAcctId.\${sls:stage}}`,
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      COGNITO_USER_POOL_NAME: `ScoreBridgeCognitoUserPool-\${sls:stage}`,
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      SES_FROM_ADDRESS: `\${self:custom.settings.sesFromAddress.\${sls:stage}}`,
      STAGE: `\${sls:stage}`,
    },
  },
  resources: {
    Resources: {
      ...CognitoResources,
      ...DynamoDbTables,
      ...AdditionalAppSyncResources,
      ...SesResources,
      ...SnsResources,
      ...SqsResources,
    },
    Outputs: {
      // CognitoUserPoolId: {
      //   Value: {
      //     Ref: "CognitoUserPool",
      //   },
      // },

      AwsRegion: { Value: `\${aws:region}` },

      // CognitoUserPoolClientIdWeb: {
      //   Value: {
      //     Ref: "UserPoolClientWeb",
      //   },
      // },
      // CognitoUserPoolClientIdAutomatedTests: {
      //   Value: {
      //     Ref: "UserPoolClientAutomatedTests",
      //   },
      // },
      AddClubApiKey: {
        Value: {
          "Fn::GetAtt": ["AddClubApiKey", "ApiKey"],
        },
      },
      SesSandboxSqsQueueUrl: {
        Value: {
          "Fn::GetAtt": ["SesSandboxSqsQueue", "QueueUrl"],
        },
      },
    },
  },
  appSync,
};

module.exports = serverlessConfiguration;
