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

const awsAccountIdPerStage = (stage: string) => {
  if (stage === "dev") {
    return "437893194722";
  }
  if (stage === "staging") {
    return "655935885730";
  }
  if (stage === "prod") {
    return "515279954553";
  }
  throw new Error(`No AWS account created for stage ${stage}.`);
};

const sesFromAddressPerStage = (stage: string) => {
  if (stage === "dev") {
    return "scorebridge8+dev@gmail.com";
  }
  if (stage === "staging") {
    // return "scorebridge8+staging@gmail.com";
  }
  if (stage === "prod") {
    // return "scorebridge8@gmail.com";
  }
  throw new Error(`No SES From: email has been verified stage ${stage}.`);
};
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
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      STAGE: `\${sls:stage}`,
      AWS_ACCOUNT_ID: awsAccountIdPerStage(
        "dev", // todo: this can't be a plain ts fn, because we need the substitution by sls first, then alternation
      ),
      SES_FROM_ADDRESS: sesFromAddressPerStage(
        "dev", // see above todo, just proceeding for now
      ),
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
      COGNITO_USER_POOL_NAME: `ScoreBridgeCognitoUserPool-\${sls:stage}`,
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
      CognitoUserPoolId: {
        Value: {
          Ref: "CognitoUserPool",
        },
      },

      AwsRegion: { Value: `\${aws:region}` },

      CognitoUserPoolClientIdWeb: {
        Value: {
          Ref: "UserPoolClientWeb",
        },
      },
      CognitoUserPoolClientIdAutomatedTests: {
        Value: {
          Ref: "UserPoolClientAutomatedTests",
        },
      },
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
