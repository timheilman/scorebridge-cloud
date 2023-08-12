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
