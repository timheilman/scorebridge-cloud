import type { AWS } from "@serverless/typescript";

// import hello from '@functions/hello';
import confirmUserSignup from "@functions/confirm-user-signup";
import { appsyncApi } from "./serverless.appsync-api";

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
  functions: { confirmUserSignup },
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
      CognitoUserPool: {
        Type: "AWS::Cognito::UserPool",
        Properties: {
          AutoVerifiedAttributes: ["email"],
          Policies: {
            PasswordPolicy: {
              MinimumLength: 8,
              RequireLowercase: true,
              RequireNumbers: true,
              RequireUppercase: true,
              RequireSymbols: true,
            },
          },
          UsernameAttributes: ["email"],
          Schema: [
            {
              AttributeDataType: "String",
              Name: "name",
              Required: false,
              Mutable: true,
            },
          ],
          LambdaConfig: {
            PostConfirmation: {
              "Fn::GetAtt": ["ConfirmUserSignupLambdaFunction", "Arn"],
            },
          },
          UserPoolName: `\${self:custom.settings.COGNITO_USER_POOL_NAME}`,
        },
      },
      WebUserPoolClient: {
        Type: "AWS::Cognito::UserPoolClient",
        Properties: {
          UserPoolId: {
            Ref: "CognitoUserPool",
          },
          ClientName: "web",
          ExplicitAuthFlows: [
            "ALLOW_USER_SRP_AUTH",
            "ALLOW_USER_PASSWORD_AUTH",
            "ALLOW_REFRESH_TOKEN_AUTH",
          ],
          PreventUserExistenceErrors: "ENABLED",
        },
      },
      UsersTable: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          BillingMode: "PAY_PER_REQUEST",
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH",
            },
          ],
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S",
            },
          ],
          Tags: [
            {
              Key: "Environment",
              Value: `\${sls:stage}`,
            },
            {
              Key: "Name",
              Value: "users-table",
            },
          ],
        },
      },
    },
    Outputs: {
      CognitoUserPoolId: {
        Value: {
          Ref: "CognitoUserPool",
        },
      },
    },
  },
  appSync: appsyncApi,
};

module.exports = serverlessConfiguration;
