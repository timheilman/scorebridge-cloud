// import { AppSyncConfig } from "serverless-appsync-plugin/src/types/plugin"
export default {
  SesConfigSet: {
    Condition: "StageIsNotProd",
    Type: "AWS::SES::ConfigurationSet",
    Properties: { Name: "SesConfigSet${sls:stage}" },
  },
  SesConfigSetEventDestination: {
    Type: "AWS::SES::ConfigurationSetEventDestination",
    Condition: "StageIsNotProd",
    DependsOn: ["SesSandboxSnsTopic", "SesConfigSet"],
    Properties: {
      ConfigurationSetName: { Ref: "SesConfigSet" },
      EventDestination: {
        Enabled: true,
        SnsDestination: {
          TopicARN: { Ref: "SesSandboxSnsTopic" },
        },
        // for event type list, see
        // https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-ses-configurationseteventdestination-eventdestination.html
        MatchingEventTypes: ["delivery"],
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
