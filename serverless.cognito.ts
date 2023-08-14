import { inviteMessageTemplate } from "./serverless.cognito.inviteMessageTemplate";

export default {
  CognitoUserPool: {
    Type: "AWS::Cognito::UserPool",
    Properties: {
      AutoVerifiedAttributes: ["email"],
      Policies: {
        PasswordPolicy: {
          MinimumLength: 8,
          RequireLowercase: false,
          RequireNumbers: false,
          RequireUppercase: false,
          RequireSymbols: false,
        },
      },
      UsernameAttributes: ["email"],
      EmailConfiguration: {
        EmailSendingAccount: "DEVELOPER",
        ReplyToEmailAddress: "scorebridge8+do-not-reply@gmail.com",
        From:
          `ScoreBridge Admin Portal ` +
          `<\${self:custom.settings.SES_FROM_ADDRESS}>`,
        SourceArn:
          `arn:aws:ses:\${aws:region}:` +
          `\${self:custom.settings.AWS_ACCOUNT_ID}:` +
          `identity/\${self:custom.settings.SES_FROM_ADDRESS}`,
      },
      Schema: [
        {
          AttributeDataType: "String",
          Name: "name",
          Required: false,
          Mutable: true,
        },
        {
          AttributeDataType: "String",
          Name: "tenantId",
          Required: false, // true is not yet supported, plus adminSuper has none
          Mutable: true, // setting at creation causes failure during password reset, so trying mutable
        },
        // TODO: after checking in, comment-out all cognito again *sigh* because cannot remove these
      ],
      LambdaConfig: {
        PostConfirmation: {
          "Fn::GetAtt": ["ConfirmUserSignupLambdaFunction", "Arn"],
        },
      },
      UserPoolName: `\${self:custom.settings.COGNITO_USER_POOL_NAME}`,
      AdminCreateUserConfig: {
        AllowAdminCreateUserOnly: true,
        InviteMessageTemplate: {
          EmailMessage: inviteMessageTemplate,
          EmailSubject: `\${self:custom.settings.INVITE_MESSAGE_SUBJECT}`,
        },
      },
    },
  },
  AdminSuperGroup: {
    Type: "AWS::Cognito::UserPoolGroup",
    Properties: {
      UserPoolId: { Ref: "CognitoUserPool" },
      GroupName: "adminSuper",
    },
  },
  AdminClubGroup: {
    Type: "AWS::Cognito::UserPoolGroup",
    Properties: {
      UserPoolId: { Ref: "CognitoUserPool" },
      GroupName: "adminClub",
    },
  },
  TabletTableGroup: {
    Type: "AWS::Cognito::UserPoolGroup",
    Properties: {
      UserPoolId: { Ref: "CognitoUserPool" },
      GroupName: "tabletTable",
    },
  },
  UserPoolClientWeb: {
    Type: "AWS::Cognito::UserPoolClient",
    Properties: {
      UserPoolId: {
        Ref: "CognitoUserPool",
      },
      ClientName: "web",
      ExplicitAuthFlows: [
        "ALLOW_USER_SRP_AUTH",
        "ALLOW_USER_PASSWORD_AUTH",
        "ALLOW_REFRESH_TOKEN_AUTH",
      ],
    },
  },
  UserPoolClientAutomatedTests: {
    Type: "AWS::Cognito::UserPoolClient",
    Properties: {
      UserPoolId: {
        Ref: "CognitoUserPool",
      },
      ClientName: "automatedTests",
      ExplicitAuthFlows: [
        "ALLOW_USER_SRP_AUTH",
        "ALLOW_USER_PASSWORD_AUTH",
        "ALLOW_REFRESH_TOKEN_AUTH",
      ],
    },
  },
};
