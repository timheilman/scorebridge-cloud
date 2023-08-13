export default {
  SesSandboxSnsTopic: {
    Type: "AWS::SNS::Topic",
    Properties: {
      DisplayName: "SesSandboxNotifications",
    },
  },
  SesSandboxNotificationsPolicy: {
    Type: "AWS::SNS::TopicPolicy",
    Properties: {
      PolicyDocument: {
        Version: "2012-10-17",
        Id: "SesSandboxNotificationsPolicy",
        Statement: [
          {
            Effect: "Allow",
            Principal: {
              Service: "ses.amazonaws.com",
            },
            Action: "sns:Publish",
            Resource: {
              Ref: "SesSandboxSnsTopic",
            },
            Condition: {
              StringEquals: {
                "AWS:SourceAccount": `\${self:provider.environment.AWS_ACCOUNT_ID}`,
              },
              ArnLike: {
                "AWS:SourceArn": `arn:aws:ses:\${aws:region}:\${self:provider.environment.AWS_ACCOUNT_ID}:*`,
              },
            },
          },
        ],
      },
      Topics: [
        {
          Ref: "SesSandboxSnsTopic",
        },
      ],
    },
  },
};
