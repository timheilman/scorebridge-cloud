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
import requiredEnvVar from "@libs/requiredEnvVar";
import { AppSyncResolverEvent } from "aws-lambda";
import { AppSyncResolverHandler } from "aws-lambda/trigger/appsync-resolver";
import { ulid } from "ulid";

import {
  AddClubInput,
  AddClubResponse,
  MutationAddClubArgs,
} from "../../../appsync";

async function logCompletionDecorator<T>(promise: Promise<T>, message: string) {
  const r = await promise;
  console.log(message);
  return r;
}

const getCognitoUser = async (email: string) => {
  try {
    const getUserCommand = new AdminGetUserCommand({
      UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
      Username: email,
    });
    return await cachedCognitoIdpClient().send(getUserCommand);
  } catch (e) {
    console.error(`Error getting user ${email}:`, e);
    throw e;
  }
};

async function cognitoCreateUser(
  email: string,
  invitationEmailAction: "SUPPRESS" | "RESEND" | undefined,
) {
  try {
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
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

const reinviteUser = async (email: string) => {
  return cognitoCreateUser(email, "RESEND");
};
const getNullableUser = async (email: string) => {
  try {
    return await getCognitoUser(email);
  } catch (problem) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (problem?.errorType === "UserNotFoundException") {
      return null;
    }
    console.error("unexpected problem!", problem);
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      ":val1": newClubName,
    }),
  });
  return await cachedDynamoDbClient().send(updateClubDdbCommand);
};

async function ddbCreateClub(clubId: string, clubName: string) {
  try {
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
  } catch (error) {
    console.error("Error creating ddb club", error);
    throw error;
  }
}

async function ddbCreateUser(userId: string, email: string) {
  try {
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
  } catch (error) {
    console.error("Error creating ddb user", error);
    throw error;
  }
}

async function cognitoAddUserToGroup(userId: string) {
  try {
    const params = {
      GroupName: "adminClub",
      UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
      Username: userId, // note: email also works here
    };
    const command = new AdminAddUserToGroupCommand(params);
    await cachedCognitoIdpClient().send(command);
    console.log("User added to the adminClub group successfully");
  } catch (error) {
    console.error("Error adding user to the adminClub group:", error);
  }
}

async function cognitoUpdateUserTenantId(clubId: string, userId: string) {
  try {
    const updateUserParams: AdminUpdateUserAttributesCommandInput = {
      UserAttributes: [{ Name: "custom:tenantId", Value: clubId }],
      UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
      Username: userId, // note: email also works here!
    };
    const updateUserCommand = new AdminUpdateUserAttributesCommand(
      updateUserParams,
    );
    await cachedCognitoIdpClient().send(updateUserCommand);
  } catch (error) {
    console.error("Error updating user to adminClub role:", error);
    throw error;
  }
}

async function readdClub(input: AddClubInput, user: AdminGetUserCommandOutput) {
  const clubId = user.UserAttributes.find(
    (at) => at.Name === "custom:tenantId",
  ).Value;
  const clubUpdatePromise = updateClubName(clubId, input.newClubName);
  const addlPromises: Promise<AdminCreateUserCommandOutput>[] =
    input.suppressInvitationEmail
      ? []
      : [
          logCompletionDecorator(
            reinviteUser(input.newAdminEmail),
            "Reinvited user email successfully",
          ),
        ];
  await Promise.all([
    logCompletionDecorator(
      clubUpdatePromise,
      "Updated club to new club name successfully",
    ),
    ...addlPromises,
  ]);
  return { data: { userId: user.Username, clubId: clubId } };
}

async function handleFoundCognitoUser(
  user: AdminGetUserCommandOutput,
  input: AddClubInput,
) {
  if (user.UserStatus === "FORCE_CHANGE_PASSWORD") {
    return await readdClub(input, user);
  } else {
    throw new Error(
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
  // start club creation in parallel since it does not need userId
  const ddbCreateClubPromise = ddbCreateClub(clubId, newClubName);

  // everything else needs teh userId, so await its creation
  const createdUser = await logCompletionDecorator(
    cogCreateUserPromise,
    "Cognito user created successfully",
  );
  const userId = createdUser.User.Username;
  // the ddbClub creation and remaining userId-dependent promises can be awaited in parallel
  await Promise.all([
    logCompletionDecorator(
      cognitoUpdateUserTenantId(clubId, userId),
      "Cognito user tenantId set successfully",
    ),
    logCompletionDecorator(
      cognitoAddUserToGroup(userId),
      "Cognito user added to clubAdmin group successfully",
    ),
    logCompletionDecorator(
      ddbCreateUser(userId, newAdminEmail),
      "Ddb user created successfully",
    ),
    logCompletionDecorator(
      ddbCreateClubPromise,
      "Ddb club created successfully",
    ),
  ]);

  return {
    data: {
      userId: userId,
      clubId: clubId,
    },
  };
}

export const main: AppSyncResolverHandler<
  MutationAddClubArgs,
  AddClubResponse
> = async (
  event: AppSyncResolverEvent<MutationAddClubArgs>,
): Promise<AddClubResponse> => {
  try {
    const user = await logCompletionDecorator(
      getNullableUser(event.arguments.input.newAdminEmail),
      "Discovered cognito user existence successfully",
    );
    if (user) {
      return await handleFoundCognitoUser(user, event.arguments.input);
    } else {
      return await handleNoSuchCognitoUser(event.arguments.input);
    }
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    return { errors: [{ message: error.message }] };
  }
};
