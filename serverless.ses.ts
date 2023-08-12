// import { AppSyncConfig } from "serverless-appsync-plugin/src/types/plugin"
export default {
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
