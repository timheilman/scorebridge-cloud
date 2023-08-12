export default {
  SesSandboxSqsQueue: {
    Type: "AWS::SQS::Queue",
    Properties: {
      QueueName: "SesSandboxQueue",
      RedrivePolicy: {
        deadLetterTargetArn: {
          "Fn::GetAtt": ["SesSandboxDlQueue", "Arn"],
        },
        maxReceiveCount: 3,
      },
    },
  },
  SesSandboxDlQueue: {
    Type: "AWS::SQS::Queue",
    Properties: {
      QueueName: "SESSandboxDlQueue",
    },
  },
  SesSandboxSnsSubscription: {
    Type: "AWS::SNS::Subscription",
    Properties: {
      Protocol: "sqs",
      TopicArn: { Ref: "SesSandboxSnsTopic" },
      Endpoint: { "Fn::GetAtt": ["SesSandboxSqsQueue", "Arn"] },
    },
  },
  SesSandboxSqsPermission: {
    Type: "AWS::SQS::QueuePolicy",
    Properties: {
      Queues: [{ Ref: "SesSandboxSqsQueue" }],
      PolicyDocument: {
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: "*",
            Action: "sqs:SendMessage",
            Resource: { "Fn::GetAtt": ["SesSandboxSqsQueue", "Arn"] },
            Condition: {
              ArnEquals: {
                "aws:SourceArn": { Ref: "SesSandboxSnsTopic" },
              },
            },
          },
        ],
      },
    },
  },
};
