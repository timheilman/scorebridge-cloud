import {
  AdminCreateUserCommandOutput,
  AdminGetUserCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  PutItemCommand,
  UpdateItemCommand,
  UpdateItemCommandOutput,
} from "@aws-sdk/client-dynamodb";
import { GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { marshall } from "@aws-sdk/util-dynamodb";
import {
  cognitoAddUserToGroup,
  cognitoCreateUser,
  cognitoUpdateUserTenantId,
  getNullableUser,
} from "@libs/cognito";
import { dynamoDbClient } from "@libs/ddb";
import { UserAlreadyExistsError } from "@libs/errors/user-already-exists-error";
import { UserIsBotError } from "@libs/errors/user-is-bot-error";
import { middyWithErrorHandling } from "@libs/lambda";
import { logFn } from "@libs/logging";
import { secretsManagerClient } from "@libs/secretsManager";
import { AppSyncResolverEvent } from "aws-lambda";
import { AppSyncResolverHandler } from "aws-lambda/trigger/appsync-resolver";
import axios from "axios";
import { ulid } from "ulid";

import {
  CreateClubInput,
  CreateClubResponse,
  MutationCreateClubArgs,
} from "../../../appsync";
import { logCompletionDecoratorFactory } from "../../../scorebridge-ts-submodule/logCompletionDecorator";
import requiredEnvVar from "../../../scorebridge-ts-submodule/requiredEnvVar";

const log = logFn("src.functions.create-club.handler.");
const lcd = logCompletionDecoratorFactory(log);
const reinviteUser = async (email: string) => {
  return cognitoCreateUser(email, "RESEND");
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
  return await dynamoDbClient().send(updateClubDdbCommand);
};

export async function ddbCreateClub(clubId: string, clubName: string) {
  const club = marshall({
    id: clubId,
    name: clubName,
    createdAt: new Date().toJSON(),
    updatedAt: new Date().toJSON(),
  });
  const createClubDdbCommand = new PutItemCommand({
    TableName: requiredEnvVar("CLUBS_TABLE"),
    Item: club,
    ConditionExpression: "attribute_not_exists(id)",
  });
  log("ddbCreateClub.send", "debug", { createClubDdbCommand });
  await dynamoDbClient().send(createClubDdbCommand);
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
  await dynamoDbClient().send(createUserDdbCommand);
}

async function readdClub(
  input: CreateClubInput,
  user: AdminGetUserCommandOutput,
) {
  const clubId = user.UserAttributes.find(
    (at) => at.Name === "custom:tenantId",
  ).Value;
  const promises: Promise<unknown>[] = [];
  promises.push(
    lcd(updateClubName(clubId, input.newClubName), "updateClubName", {
      clubId,
      newClubName: input.newClubName,
    }),
  );
  if (!input.suppressInvitationEmail) {
    promises.push(
      lcd(reinviteUser(input.newAdminEmail), "reinviteUser", {
        newAdminEmail: input.newAdminEmail,
      }) as Promise<AdminCreateUserCommandOutput>,
    );
  }
  await Promise.all(promises);
  return { userId: user.Username, clubId: clubId };
}

async function handleFoundCognitoUser(
  user: AdminGetUserCommandOutput,
  input: CreateClubInput,
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
}: CreateClubInput) {
  const clubId = ulid();
  // start get-club creation in parallel since it does not need userId
  const ddbCreateClubPromise = ddbCreateClub(clubId, newClubName);

  // everything else needs the userId, so await its creation
  const createdUser = (await lcd(
    cognitoCreateUser(
      newAdminEmail,
      suppressInvitationEmail ? "SUPPRESS" : undefined,
    ),
    "cognitoCreateUser",
    { newAdminEmail, suppressInvitationEmail },
  )) as AdminCreateUserCommandOutput; // I do not understand why this cast is needed
  const userId = createdUser.User.Username;
  // the ddbClub creation and remaining userId-dependent promises can be awaited in parallel
  await Promise.all([
    lcd(cognitoUpdateUserTenantId(userId, clubId), "cognitoUpdateUserTenantId"),
    lcd(cognitoAddUserToGroup(userId, "adminClub"), "cognitoAddUserToGroup"),
    lcd(ddbCreateUser(userId, newAdminEmail), "ddbCreateUser"),
    lcd(ddbCreateClubPromise, "ddbCreateClubPromise"),
  ]);

  return { userId: userId, clubId: clubId };
}

const almostMain: AppSyncResolverHandler<
  MutationCreateClubArgs,
  CreateClubResponse
> = async (
  event: AppSyncResolverEvent<MutationCreateClubArgs>,
): Promise<CreateClubResponse> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
  const recaptchaSecret = JSON.parse(
    (
      await secretsManagerClient().send(
        new GetSecretValueCommand({
          SecretId: `${requiredEnvVar("STAGE")}.recaptcha2Secret`,
        }),
      )
    ).SecretString,
  ).secretKey;
  const response = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${event.arguments.input.recaptchaToken}`,
  );
  log("recaptchaV2Widget.validationResponse", "debug", { response });

  // Check response status and send back to the client-side
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (response.data?.success) {
    const user = (await lcd(
      getNullableUser(event.arguments.input.newAdminEmail),
      "getNullableUser",
      { newAdminEmail: event.arguments.input.newAdminEmail },
    )) as AdminGetUserCommandOutput; // again I do not understand why this is needed
    if (user) {
      return await handleFoundCognitoUser(user, event.arguments.input);
    } else {
      return await handleNoSuchCognitoUser(event.arguments.input);
    }
  } else {
    log("recaptchaV2Widget.badRecaptchaResponse", "warn");
    throw new UserIsBotError("Validation of recaptcha2 widget failed");
  }
};
export const main = middyWithErrorHandling(almostMain);
