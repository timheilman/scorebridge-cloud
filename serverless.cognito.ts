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
        ReplyToEmailAddress: `\${self:custom.settings.SES_REPLY_TO_ADDRESS}`,
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
      ],
      // LambdaConfig: {
      //   PostConfirmation: {
      // Turns out this was not firing due to admin-based commands, so nix it:
      //     "Fn::GetAtt": ["ConfirmUserSignupLambdaFunction", "Arn"],
      //   },
      // },
      UserPoolName: `\${self:custom.settings.COGNITO_USER_POOL_NAME}`,
      AdminCreateUserConfig: {
        AllowAdminCreateUserOnly: true,
        InviteMessageTemplate: {
          EmailMessage: inviteMessageTemplate({
            loginUrl: `\${self:custom.settings.PORTAL_URL}`,
            portalName: `\${self:custom.settings.PORTAL_NAME}`,
          }),
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
  ClubDeviceGroup: {
    Type: "AWS::Cognito::UserPoolGroup",
    Properties: {
      UserPoolId: { Ref: "CognitoUserPool" },
      GroupName: "clubDevice",
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
  UserPoolClientAutomatedTest: {
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
  UserPoolClientClubDevice: {
    Type: "AWS::Cognito::UserPoolClient",
    Properties: {
      UserPoolId: {
        Ref: "CognitoUserPool",
      },
      ClientName: "clubDevice",
      ExplicitAuthFlows: [
        "ALLOW_USER_SRP_AUTH",
        "ALLOW_USER_PASSWORD_AUTH",
        "ALLOW_REFRESH_TOKEN_AUTH",
      ],
      TokenValidityUnits: {
        AccessToken: "hours",
        IdToken: "hours",
        RefreshToken: "days",
      },
      RefreshTokenValidity: 3650,
    },
  },
};
