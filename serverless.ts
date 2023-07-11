import type { AWS } from "@serverless/typescript";

// import hello from '@functions/hello';
import confirmUserSignup from "@functions/confirm-user-signup";
import exampleLambdaDataSource from "@functions/example-lambda-data-source";
import appsyncApi from "./serverless.appsync-api";
import { UsersTable, ClubsTable } from "./serverless.dynamodb-tables";

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
  functions: { confirmUserSignup, exampleLambdaDataSource },
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
              RequireLowercase: false,
              RequireNumbers: false,
              RequireUppercase: false,
              RequireSymbols: false,
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
            {
              AttributeDataType: "String",
              Name: "role",
              Required: false, // true is not yet supported
              Mutable: true, // setting at creation causes failure during password reset, so trying mutable
            },
            {
              AttributeDataType: "String",
              Name: "tenantId",
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
          AdminCreateUserConfig: {
            AllowAdminCreateUserOnly: true,
          },
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
      UserPoolInvokeConfirmUserSignupLambdaPermission: {
        Type: "AWS::Lambda::Permission",
        Properties: {
          Action: "lambda:invokeFunction",
          FunctionName: {
            Ref: "ConfirmUserSignupLambdaFunction",
          },
          Principal: "cognito-idp.amazonaws.com",
          SourceArn: {
            "Fn::GetAtt": ["CognitoUserPool", "Arn"],
          },
        },
      },
      UsersTable,
      ClubsTable,
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
  appSync: appsyncApi,
};

module.exports = serverlessConfiguration;
