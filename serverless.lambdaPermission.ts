export default {
  UserPoolInvokeConfirmUserSignupLambdaPermission: {
    Type: "AWS::Lambda::Permission",
    Properties: {
      Action: "lambda:invokeFunction",
      FunctionName: { Ref: "ConfirmUserSignupLambdaFunction" },
      Principal: "cognito-idp.amazonaws.com",
      SourceArn: { "Fn::GetAtt": ["CognitoUserPool", "Arn"] },
    },
  },
};
