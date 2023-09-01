import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminGetUserCommand,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  AdminUpdateUserAttributesCommandInput,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";

import cachedCognitoIdpClient from "../../scorebridge-ts-submodule/cachedCognitoIdpClient";
import requiredEnvVar from "./requiredEnvVar";

export function cognitoClient(): CognitoIdentityProviderClient {
  return cachedCognitoIdpClient(
    requiredEnvVar("AWS_REGION"),
    process.env.SB_TEST_AWS_CLI_PROFILE
      ? process.env.SB_TEST_AWS_CLI_PROFILE
      : null,
  );
}

export async function cognitoAddUserToGroup(userId: string, groupName: string) {
  const params = {
    GroupName: groupName,
    UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
    Username: userId, // note: email also works here
  };
  const command = new AdminAddUserToGroupCommand(params);
  return await cognitoClient().send(command);
}

export async function cognitoUpdateUserTenantId(
  userId: string,
  clubId: string,
) {
  const updateUserParams: AdminUpdateUserAttributesCommandInput = {
    UserAttributes: [{ Name: "custom:tenantId", Value: clubId }],
    UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
    Username: userId, // note: email also works here!
  };
  const updateUserCommand = new AdminUpdateUserAttributesCommand(
    updateUserParams,
  );
  return await cognitoClient().send(updateUserCommand);
}

export async function cognitoCreateUser(
  email: string,
  invitationEmailAction: "SUPPRESS" | "RESEND" | undefined,
) {
  // Because there is a quota on the number of emails we may send using cognito, but
  // it is far beyond anything expected in production, we suppress emails when testing
  const emailAction = invitationEmailAction
    ? { MessageAction: invitationEmailAction }
    : {};
  const createUserParams = {
    UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
    Username: email,
    UserAttributes: [{ Name: "email", Value: email }],
    ...emailAction,
  };

  const createUserCommand = new AdminCreateUserCommand(createUserParams);
  return cognitoClient().send(createUserCommand);
}
export const getNullableUser = async (email: string) => {
  try {
    return await getCognitoUser(email);
  } catch (problem) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (problem.__type === "UserNotFoundException") {
      return null;
    }
    throw problem;
  }
};

export const getCognitoUser = async (email: string) => {
  const getUserCommand = new AdminGetUserCommand({
    UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
    Username: email,
  });
  return await cognitoClient().send(getUserCommand);
};

export async function cognitoSetNewPassword(
  userId: string,
  newPassword: string,
) {
  const params = {
    UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
    Username: userId,
    Password: newPassword,
    Permanent: true,
  };
  const command = new AdminSetUserPasswordCommand(params);
  return await cognitoClient().send(command);
}

export async function cognitoDestroyUser(userId: string) {
  return cognitoClient().send(
    new AdminDeleteUserCommand({
      UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
      Username: userId,
    }),
  );
}
