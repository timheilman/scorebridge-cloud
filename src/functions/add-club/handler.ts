import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminGetUserCommand,
  AdminGetUserCommandOutput,
  AdminUpdateUserAttributesCommand,
  AdminUpdateUserAttributesCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import { cachedCognitoIdpClient } from "@libs/cognito";
import { UserAlreadyExistsError } from "@libs/errors/user-already-exists-error";
import { middyWithErrorHandling } from "@libs/lambda";
import { logCompletionDecorator as lcd } from "@libs/log-completion-decorator";
import requiredEnvVar from "@libs/requiredEnvVar";
import { AppSyncResolverEvent } from "aws-lambda";
import { AppSyncResolverHandler } from "aws-lambda/trigger/appsync-resolver";
import { ulid } from "ulid";

import {
  AddClubInput,
  AddClubResponse,
  MutationAddClubArgs,
} from "../../../appsync";

const getCognitoUser = async (email: string) => {
  const getUserCommand = new AdminGetUserCommand({
    UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
    Username: email,
  });
  return await cachedCognitoIdpClient().send(getUserCommand);
};

async function cognitoCreateUser(
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
  return cachedCognitoIdpClient().send(createUserCommand);
}

const reinviteUser = async (email: string) => {
  return cognitoCreateUser(email, "RESEND");
};
const getNullableUser = async (email: string) => {
  try {
    return await getCognitoUser(email);
  } catch (problem) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (problem.__type === "UserNotFoundException") {
      return null;
    }
    console.error("unexpected problem!", problem);
    throw problem;
  }
};

async function cognitoAddUserToGroup(userId: string) {
  const params = {
    GroupName: "adminClub",
    UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
    Username: userId, // note: email also works here
  };
  const command = new AdminAddUserToGroupCommand(params);
  await cachedCognitoIdpClient().send(command);
  console.log("User added to the adminClub group successfully");
}

function cognitoUpdateUserAttrs(
  attrs: { Value: string; Name: string }[],
  userId: string,
) {
  const updateUserParams: AdminUpdateUserAttributesCommandInput = {
    UserAttributes: attrs,
    UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
    Username: userId, // note: email also works here!
  };
  const updateUserCommand = new AdminUpdateUserAttributesCommand(
    updateUserParams,
  );
  return cachedCognitoIdpClient().send(updateUserCommand);
}

async function cognitoInsertClubAttributes(
  userId: string,
  clubId: string,
  clubName: string,
) {
  return cognitoUpdateUserAttrs(
    [
      { Name: "custom:tenantId", Value: clubId },
      { Name: "custom:initialClubName", Value: clubName },
    ],
    userId,
  );
}

async function cognitoUpdateClubNameAttribute(
  userId: string,
  clubName: string,
) {
  return cognitoUpdateUserAttrs(
    [{ Name: "custom:initialClubName", Value: clubName }],
    userId,
  );
}

async function handleFoundCognitoUser(
  user: AdminGetUserCommandOutput,
  input: AddClubInput,
) {
  if (user.UserStatus === "FORCE_CHANGE_PASSWORD") {
    const promises: Promise<unknown>[] = [];
    promises.push(
      lcd(
        cognitoUpdateClubNameAttribute(user.Username, input.newClubName),
        "Updated cognito user attribute for initial club name.",
      ),
    );
    if (!input.suppressInvitationEmail) {
      promises.push(
        lcd(reinviteUser(input.newAdminEmail), "Reinvited found user."),
      );
    }
    await Promise.all(promises);
    return {
      userId: user.Username,
      clubId: user.UserAttributes.find((a) => a.Name === "custom:tenantId")
        .Value,
    };
  } else {
    throw new UserAlreadyExistsError(
      `An account has already been registered under this email address: ${input.newAdminEmail}.`,
    );
  }
}

async function handleNoSuchCognitoUser({
  newAdminEmail,
  suppressInvitationEmail,
  newClubName,
}: AddClubInput) {
  const clubId = ulid();
  // start user creation first since its userId generation is canonical and needed later
  const cogCreateUserPromise = cognitoCreateUser(
    newAdminEmail,
    suppressInvitationEmail ? "SUPPRESS" : undefined,
  );
  // other two need the userId, so await its creation
  const createdUser = await lcd(
    cogCreateUserPromise,
    "Cognito user created successfully",
  );
  const userId = createdUser.User.Username;
  // the ddbClub creation and remaining userId-dependent promises can be awaited in parallel
  await Promise.all([
    lcd(
      cognitoInsertClubAttributes(userId, clubId, newClubName),
      "Cognito user tenantId set successfully",
    ),
    lcd(
      cognitoAddUserToGroup(userId),
      "Cognito user added to clubAdmin group successfully",
    ),
  ]);

  return { userId: userId, clubId: clubId };
}

const almostMain: AppSyncResolverHandler<
  MutationAddClubArgs,
  AddClubResponse
> = async (
  event: AppSyncResolverEvent<MutationAddClubArgs>,
): Promise<AddClubResponse> => {
  const user = await lcd(
    getNullableUser(event.arguments.input.newAdminEmail),
    "Discovered cognito user existence successfully",
  );
  if (user) {
    return await handleFoundCognitoUser(user, event.arguments.input);
  } else {
    return await handleNoSuchCognitoUser(event.arguments.input);
  }
};

export const main = middyWithErrorHandling(almostMain);
