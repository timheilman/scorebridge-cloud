// import { AppSyncConfig } from "serverless-appsync-plugin/src/types/plugin"
export default {
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
};