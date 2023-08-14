// import { AppSyncConfig } from "serverless-appsync-plugin/src/types/plugin"
const head = `<head><title>email title</title></head>`;
const heading = `<h2>Welcome to the ScoreBridge-\${sls:stage} Portal</h2>`;
const list = `<ul><li>Username: {username}</li><li>Password: {####}</li></ul>`;
const footer = `<hr/><a href="https://localhost:3000/">https://localhost:3000/</a>`;
const info = `<p>Please use these credentials to <a href="http://localhost:3000/"/>login</a>:</p>${list}${footer}`;
const body = `<body>${heading}${info}</body>`;
const inviteMessageTemplate = `<html>${head}${body}</html>`;
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
      EmailConfiguration: {
        EmailSendingAccount: "DEVELOPER",
        ReplyToEmailAddress: "scorebridge8+do-not-reply@gmail.com",
        From:
          `ScoreBridge Admin Portal ` +
          `<\${self:custom.settings.SES_FROM_ADDRESS}>`,
        SourceArn:
          `arn:aws:ses:\${aws:region}:` +
          `\${self:custom.settings.AWS_ACCOUNT_ID}:` +
          `identity/\${self:custom.settings.SES_FROM_ADDRESS}`,
      },
      Schema: [
        {
          AttributeDataType: "String",
          Name: "name",
          Required: false,
          Mutable: true,
        },
        {
          AttributeDataType: "String",
          Name: "tenantId",
          Required: false, // true is not yet supported, plus adminSuper has none
          Mutable: true, // setting at creation causes failure during password reset, so trying mutable
        },
        {
          AttributeDataType: "String",
          Name: "role",
          Required: false, // true is not yet supported
          Mutable: true, // setting at creation causes failure during password reset, so trying mutable
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
        InviteMessageTemplate: {
          EmailMessage: inviteMessageTemplate,
          EmailSubject: "Welcome to the ScoreBridge App",
        },
      },
    },
  },
  AdminSuperGroup: {
    Type: "AWS::Cognito::UserPoolGroup",
    Properties: {
      UserPoolId: { Ref: "CognitoUserPool" },
      GroupName: "adminSuper",
    },
  },
  AdminClubGroup: {
    Type: "AWS::Cognito::UserPoolGroup",
    Properties: {
      UserPoolId: { Ref: "CognitoUserPool" },
      GroupName: "adminClub",
    },
  },
  TabletTableGroup: {
    Type: "AWS::Cognito::UserPoolGroup",
    Properties: {
      UserPoolId: { Ref: "CognitoUserPool" },
      GroupName: "tabletTable",
    },
  },
  UserPoolClientWeb: {
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
  UserPoolClientAutomatedTests: {
    Type: "AWS::Cognito::UserPoolClient",
    Properties: {
      UserPoolId: {
        Ref: "CognitoUserPool",
      },
      ClientName: "automatedTests",
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
  CognitoSesIntegrationRole: {
    Type: "AWS::IAM::Role",
    Properties: {
      AssumeRolePolicyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: {
              Service: "email.cognito-idp.amazonaws.com",
            },
            Action: "sts:AssumeRole",
          },
        ],
      },
      Policies: [
        {
          PolicyName: "AmazonCognitoIdpEmailServiceRolePolicy",
          PolicyDocument: {
            Version: "2012-10-17",
            Statement: [
              {
                Effect: "Allow",
                Action: ["ses:SendEmail", "ses:SendRawEmail"],
                Resource: "*",
              },
            ],
          },
        },
      ],
    },
  },
};
