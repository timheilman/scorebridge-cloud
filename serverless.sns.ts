export default {
  SesSandboxSnsTopic: {
    Type: "AWS::SNS::Topic",
    Condition: "StageIsNotProd",
    Properties: {
      DisplayName: "SesSandboxNotifications",
    },
  },
  SesSandboxNotificationsPolicy: {
    Type: "AWS::SNS::TopicPolicy",
    Condition: "StageIsNotProd",
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
                "AWS:SourceAccount": `\${self:custom.settings.AWS_ACCOUNT_ID}`,
              },
              ArnLike: {
                // I would really really like to know what this * is, but it seems
                // normally that would be via cloudTrail, which SES does not
                // output configSet.eventDestination SNS publishes.  The docs at
                // https://docs.aws.amazon.com/ses/latest/dg/configure-sns-notifications.html
                // are flat-out wrong regarding `identity_name`.
                //
                // Upon deployment of the ConfigSet's EventDestination, it tries
                // a publication to the topic.  Really curious what that * is
                // for that case too, since no From: address was even in context.
                "AWS:SourceArn": `arn:aws:ses:\${aws:region}:\${self:custom.settings.AWS_ACCOUNT_ID}:*`,
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
