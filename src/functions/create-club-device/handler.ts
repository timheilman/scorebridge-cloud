import {
  AdminCreateUserCommandOutput,
  AdminGetUserCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import {
  cognitoAddUserToGroup,
  cognitoCreateUser,
  cognitoSetNewPassword,
  cognitoUpdateUserTenantId,
  getNullableUser,
} from "@libs/cognito";
import { cachedDynamoDbClient } from "@libs/ddb";
import { ClubDeviceAlreadyExistsError } from "@libs/errors/club-device-already-exists-error";
import { middyWithErrorHandling } from "@libs/lambda";
import { getLogCompletionDecorator } from "@libs/logCompletionDecorator";
import requiredEnvVar from "@libs/requiredEnvVar";
import { AppSyncResolverEvent } from "aws-lambda";
import { AppSyncResolverHandler } from "aws-lambda/trigger/appsync-resolver";

import {
  CreateClubDeviceInput,
  CreateClubDeviceResponse,
  MutationCreateClubDeviceArgs,
} from "../../../appsync";

const catPrefix = "src.functions.create-club-device.handler.";
const lcd = getLogCompletionDecorator(catPrefix, "debug");

const stage = requiredEnvVar("STAGE");
function newEmail(regToken: string) {
  return regTokenToEmail(regToken, stage);
}

export async function ddbCreateClubDevice(
  clubId: string,
  deviceName: string,
  regToken: string,
) {
  const clubDevice = marshall({
    clubId: clubId,
    clubDeviceId: newEmail(regToken),
    name: deviceName,
    createdAt: new Date().toJSON(),
    updatedAt: new Date().toJSON(),
  });
  const createDdbCommand = new PutItemCommand({
    TableName: requiredEnvVar("CLUB_DEVICES_TABLE"),
    Item: clubDevice,
  });
  await lcd(
    cachedDynamoDbClient().send(createDdbCommand),
    "ddbCreateClubDevice.send",
    { createDdbCommand },
  );
}

async function handleNoSuchCognitoUser({
  clubId,
  regToken,
  deviceName,
}: CreateClubDeviceInput) {
  const ddbCreatePromise = ddbCreateClubDevice(clubId, deviceName, regToken);

  // everything else needs the userId, so await its creation
  const { User } = (await lcd(
    cognitoCreateUser(newEmail(regToken), "SUPPRESS"),
    "cognitoCreateUser",
    { clubId, regTokenPublic: regTokenPublicPart(regToken), deviceName },
  )) as AdminCreateUserCommandOutput; // I do not understand why this cast is needed
  const clubDeviceId = User.Username;
  // the ddbClub creation and remaining userId-dependent promises can be awaited in parallel
  await Promise.all([
    lcd(
      cognitoUpdateUserTenantId(clubDeviceId, clubId),
      "cognitoUpdateUserTenantId",
    ),
    lcd(
      cognitoAddUserToGroup(clubDeviceId, "clubDevice"),
      "cognitoAddUserToGroup",
    ),
    lcd(
      cognitoSetNewPassword(clubDeviceId, regTokenSecretPart(regToken)),
      "cognitoSetNewPassword",
    ),
    lcd(ddbCreatePromise, "ddbCreateClubDevicePromise"),
  ]);

  return { clubDeviceId, clubDeviceEmail: newEmail(regToken) };
}

function regTokenPublicPart(regToken: string) {
  if (regToken.length < 16) {
    throw new Error("reg tokens should be 16 chars for now");
  }
  return regToken.slice(0, 8);
}

function regTokenSecretPart(regToken: string) {
  if (regToken.length < 16) {
    throw new Error("reg tokens should be 16 chars for now");
  }
  return regToken.slice(8);
}

function regTokenToEmail(regToken: string, stage: string) {
  return `scorebridge8+${stage}-clubDevice-${regTokenPublicPart(
    regToken,
  )}@gmail.com`;
}

const almostMain: AppSyncResolverHandler<
  MutationCreateClubDeviceArgs,
  CreateClubDeviceResponse
> = async (
  event: AppSyncResolverEvent<MutationCreateClubDeviceArgs>,
): Promise<CreateClubDeviceResponse> => {
  const input = event.arguments.input;
  const user = (await lcd(
    getNullableUser(newEmail(input.regToken)),
    "getNullableUser.success",
    { input },
  )) as AdminGetUserCommandOutput; // again I do not understand why this is needed
  if (user) {
    throw new ClubDeviceAlreadyExistsError(
      `A tablet has already been onboarded with that registration token.`,
    );
  } else {
    return await handleNoSuchCognitoUser(input);
  }
};
export const main = middyWithErrorHandling(almostMain);
