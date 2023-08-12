// import { AppSyncConfig } from "serverless-appsync-plugin/src/types/plugin"
export default {
  SesConfigSet: {
    Type: "AWS::SES::ConfigurationSet",
    Properties: { Name: "SesConfigSet" },
  },
  SesConfigSetEventDestination: {
    Type: "AWS::SES::ConfigurationSetEventDestination",
    Properties: {
      ConfigurationSetName: { Ref: "SesConfigSet" },
      EventDestination: {
        Enabled: true,
        SnsDestination: {
          TopicARN: { Ref: "SesSandboxSnsTopic" },
        },
      },
    },
  },
  SesSandboxVerifiedEmail: {
    Type: "AWS::SES::EmailIdentity",
    Properties: {
      EmailIdentity: `\${self:provider.environment.SES_FROM_ADDRESS}`,
      ConfigurationSetAttributes: {
        ConfigurationSetName: { Ref: "SesConfigSet" },
      },
    },
  },
  SesSandboxVerifiedEmailReceiptRule: {
    Type: "AWS::SES::ReceiptRule",
    Properties: {
      RuleSetName: "default-rule-set", // Specify the rule set name
      Rule: {
        Name: "SesSandboxVerifiedEmailRule",
        Enabled: true,
        ScanEnabled: true,
        TlsPolicy: "Optional",
        Recipients: ["success@simulator.amazonses.com"],
        Actions: [
          {
            SNSAction: {
              TopicArn: { Ref: "SesSandboxSnsTopic" }, // Specify the SNS topic for delivery notifications
            },
          },
        ],
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
