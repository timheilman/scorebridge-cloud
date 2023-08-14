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
      inviteMessageSubject: {
        dev: "Welcome to the ScoreBridge-dev App",
        staging: "Welcome to the ScoreBridge-staging App",
        prod: "Welcome to the ScoreBridge App",
      },
      portalName: {
        dev: "ScoreBridge-dev Admin Portal",
        staging: "ScoreBridge-staging Admin Portal",
        prod: "ScoreBridge Admin Portal",
      },
      portalUrl: {
        dev: "https://dev.d2efhllh5f21k3.amplifyapp.com/",
      },
      sesFromAddress: {
        dev: "scorebridge8+dev@gmail.com",
        staging: "scorebridge8+staging@gmail.com",
        prod: "scorebridge8@gmail.com",
      },
      sesReplyToAddress: {
        dev: "scorebridge8+dev-do-not-reply@gmail.com",
        staging: "scorebridge8+staging-do-not-reply@gmail.com",
        prod: "scorebridge8+do-not-reply@gmail.com",
      },
      AWS_ACCOUNT_ID: `\${self:custom.settings.awsAcctId.\${sls:stage}}`,
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      COGNITO_USER_POOL_NAME: `ScoreBridgeCognitoUserPool-\${sls:stage}`,
      INVITE_MESSAGE_SUBJECT: `\${self:custom.settings.inviteMessageSubject.\${sls:stage}}`,
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      PORTAL_NAME: `\${self:custom.settings.portalName.\${sls:stage}}`,
      PORTAL_URL: `\${self:custom.settings.portalUrl.\${sls:stage}}`,
      SES_FROM_ADDRESS: `\${self:custom.settings.sesFromAddress.\${sls:stage}}`,
      SES_REPLY_TO_ADDRESS: `\${self:custom.settings.sesReplyToAddress.\${sls:stage}}`,
      STAGE: `\${sls:stage}`,
    },
  },
  resources: {
    Conditions: {
      StageIsProd: {
        "Fn::Equals": ["prod", `\${sls:stage}`],
      },
      StageIsNotProd: {
        "Fn::Not": [{ "Fn::Equals": ["prod", `\${sls:stage}`] }],
      },
    },
    Resources: {
      ...CognitoResources,
      ...DynamoDbTables,
      ...AdditionalAppSyncResources,
      ...SesResources,
      ...SnsResources,
      ...SqsResources,
    },
    Outputs: {
      AddClubApiKey: {
        Value: {
          "Fn::GetAtt": ["AddClubApiKey", "ApiKey"],
        },
      },
      AwsRegion: { Value: `\${aws:region}` },
      CognitoUserPoolClientIdAutomatedTests: {
        Value: {
          Ref: "UserPoolClientAutomatedTests",
        },
      },
      CognitoUserPoolClientIdWeb: {
        Value: {
          Ref: "UserPoolClientWeb",
        },
      },
      CognitoUserPoolId: {
        Value: {
          Ref: "CognitoUserPool",
        },
      },
      PortalUrl: `\${self:custom.settings.PORTAL_URL}`,
      SesSandboxSqsQueueUrl: {
        Value: {
          "Fn::GetAtt": ["SesSandboxSqsQueue", "QueueUrl"],
        },
      },
      Stage: {
        Value: `\${sls:stage}`,
      },
    },
  },
  appSync,
};

module.exports = serverlessConfiguration;
