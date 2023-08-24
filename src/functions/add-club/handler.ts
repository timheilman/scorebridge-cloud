import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminCreateUserCommandOutput,
  AdminGetUserCommand,
  AdminGetUserCommandOutput,
  AdminUpdateUserAttributesCommand,
  AdminUpdateUserAttributesCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  PutItemCommand,
  UpdateItemCommand,
  UpdateItemCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { cachedCognitoIdpClient } from "@libs/cognito";
import { cachedDynamoDbClient } from "@libs/ddb";
import { UserAlreadyExistsError } from "@libs/errors/user-already-exists-error";
import { getLogCompletionDecorator } from "@libs/logCompletionDecorator";
import { logFn } from "@libs/logging";
import requiredEnvVar from "@libs/requiredEnvVar";
import { AppSyncResolverEvent } from "aws-lambda";
import { AppSyncResolverHandler } from "aws-lambda/trigger/appsync-resolver";
import { ulid } from "ulid";

import {
  AddClubInput,
  AddClubResponse,
  MutationAddClubArgs,
} from "../../../appsync";

const catPrefix = "src.functions.add-club.handler.";
const log = logFn(catPrefix);
const lcd = getLogCompletionDecorator(catPrefix, "debug");
const getCognitoUser = async (email: string) => {
  const getUserCommand = new AdminGetUserCommand({
    UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
    Username: email,
  });
  return await cachedCognitoIdpClient().send(getUserCommand);
};

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
    log("getNullableUser", "error", problem);
    throw problem;
  }
};

const updateClubName = async (
  clubId: string,
  newClubName: string,
): Promise<UpdateItemCommandOutput> => {
  const updateClubDdbCommand = new UpdateItemCommand({
    TableName: requiredEnvVar("CLUBS_TABLE"),
    Key: marshall({ id: clubId }),
    UpdateExpression: "set #name = :val1",
    ExpressionAttributeNames: { "#name": "name" },
    ExpressionAttributeValues: marshall({
      ":val1": newClubName,
    }),
  });
  return await cachedDynamoDbClient().send(updateClubDdbCommand);
};

export async function ddbCreateClub(clubId: string, clubName: string) {
  const club = marshall({
    id: clubId,
    name: clubName,
    createdAt: new Date().toJSON(),
  });
  const createClubDdbCommand = new PutItemCommand({
    TableName: requiredEnvVar("CLUBS_TABLE"),
    Item: club,
    ConditionExpression: "attribute_not_exists(id)",
  });
  await cachedDynamoDbClient().send(createClubDdbCommand);
}

export async function ddbCreateUser(userId: string, email: string) {
  const user = marshall({
    id: userId,
    email,
    createdAt: new Date().toJSON(),
  });

  const createUserDdbCommand = new PutItemCommand({
    TableName: requiredEnvVar("USERS_TABLE"),
    Item: user,
    ConditionExpression: "attribute_not_exists(id)",
  });
  await cachedDynamoDbClient().send(createUserDdbCommand);
}

export async function cognitoAddUserToGroup(userId: string, groupName: string) {
  const params = {
    GroupName: groupName,
    UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
    Username: userId, // note: email also works here
  };
  const command = new AdminAddUserToGroupCommand(params);
  await cachedCognitoIdpClient().send(command);
  log("cognitoAddUserToGroup.success", "debug");
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
  await cachedCognitoIdpClient().send(updateUserCommand);
}

async function readdClub(input: AddClubInput, user: AdminGetUserCommandOutput) {
  const clubId = user.UserAttributes.find(
    (at) => at.Name === "custom:tenantId",
  ).Value;
  const promises: Promise<unknown>[] = [];
  promises.push(
    lcd(updateClubName(clubId, input.newClubName), "updateClubName.success", {
      clubId,
      newClubName: input.newClubName,
    }),
  );
  if (!input.suppressInvitationEmail) {
    promises.push(
      lcd(reinviteUser(input.newAdminEmail), "reinviteUser.success", {
        newAdminEmail: input.newAdminEmail,
      }) as Promise<AdminCreateUserCommandOutput>,
    );
  }
  await Promise.all(promises);
  return { userId: user.Username, clubId: clubId };
}

async function handleFoundCognitoUser(
  user: AdminGetUserCommandOutput,
  input: AddClubInput,
) {
  if (user.UserStatus === "FORCE_CHANGE_PASSWORD") {
    return await readdClub(input, user);
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
  // start club creation in parallel since it does not need userId
  const ddbCreateClubPromise = ddbCreateClub(clubId, newClubName);

  // everything else needs the userId, so await its creation
  const createdUser = (await lcd(
    cognitoCreateUser(
      newAdminEmail,
      suppressInvitationEmail ? "SUPPRESS" : undefined,
    ),
    "cognitoCreateUser.success",
    { newAdminEmail, suppressInvitationEmail },
  )) as AdminCreateUserCommandOutput; // I do not understand why this cast is needed
  const userId = createdUser.User.Username;
  // the ddbClub creation and remaining userId-dependent promises can be awaited in parallel
  await Promise.all([
    lcd(
      cognitoUpdateUserTenantId(userId, clubId),
      "cognitoUpdateUserTenantId.success",
    ),
    lcd(
      cognitoAddUserToGroup(userId, "adminClub"),
      "cognitoAddUserToGroup.success",
    ),
    lcd(ddbCreateUser(userId, newAdminEmail), "ddbCreateUser.success"),
    lcd(ddbCreateClubPromise, "ddbCreateClubPromise.success"),
  ]);

  return { userId: userId, clubId: clubId };
}

export const main: AppSyncResolverHandler<
  MutationAddClubArgs,
  AddClubResponse
> = async (
  event: AppSyncResolverEvent<MutationAddClubArgs>,
): Promise<AddClubResponse> => {
  const user = (await lcd(
    getNullableUser(event.arguments.input.newAdminEmail),
    "getNullableUser.success",
    { newAdminEmail: event.arguments.input.newAdminEmail },
  )) as AdminGetUserCommandOutput; // again I do not understand why this is needed
  if (user) {
    return await handleFoundCognitoUser(user, event.arguments.input);
  } else {
    return await handleNoSuchCognitoUser(event.arguments.input);
  }
};
