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
                "AWS:SourceAccount": "111122223333",
                "AWS:SourceArn":
                  "arn:aws:ses:topic_region:111122223333:identity/identity_name",
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
