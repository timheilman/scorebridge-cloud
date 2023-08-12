// import { AppSyncConfig } from "serverless-appsync-plugin/src/types/plugin"
export default {
  SesSandboxVerifiedEmail: {
    Type: "AWS::SES::Identity",
    Properties: {
      Email: `\${self:provider.environment.SES_FROM_ADDRESS}`,
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
