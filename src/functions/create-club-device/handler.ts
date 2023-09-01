import {
  AdminCreateUserCommandOutput,
  AdminGetUserCommandOutput,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  PutItemCommandOutput,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
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
import { logFn } from "@libs/logging";
import requiredEnvVar from "@libs/requiredEnvVar";
import { AppSyncResolverEvent } from "aws-lambda";
import { AppSyncResolverHandler } from "aws-lambda/trigger/appsync-resolver";

import {
  ClubDevice,
  CreateClubDeviceInput,
  MutationCreateClubDeviceArgs,
} from "../../../appsync";
import { logCompletionDecoratorFactory } from "../../../scorebridge-ts-submodule/logCompletionDecorator";

const log = logFn("src.functions.create-club-device.handler.");
const lcd = logCompletionDecoratorFactory(log);

const stage = requiredEnvVar("STAGE");
function newEmail(regToken: string) {
  return regTokenToEmail(regToken, stage);
}

export async function ddbCreateClubDevice(
  clubId: string,
  clubDeviceId: string,
  name: string,
  regToken: string,
) {
  const clubDevice = {
    clubId: clubId,
    clubDeviceId,
    email: newEmail(regToken),
    name,
    createdAt: new Date().toJSON(),
    updatedAt: new Date().toJSON(),
  };
  const createDdbCommand = new UpdateItemCommand({
    TableName: requiredEnvVar("CLUB_DEVICES_TABLE"),
    Key: marshall({ clubId, clubDeviceId }),
    UpdateExpression:
      "SET email = :email, #name = :name, createdAt = :createdAt, updatedAt = :updatedAt",
    ExpressionAttributeNames: { "#name": "name" },
    ExpressionAttributeValues: marshall({
      ":email": clubDevice.email,
      ":name": clubDevice.name,
      ":createdAt": clubDevice.createdAt,
      ":updatedAt": clubDevice.updatedAt,
    }),
    ReturnValues: "ALL_NEW",
  });
  const result = await lcd(
    cachedDynamoDbClient().send(createDdbCommand),
    "ddbCreateClubDevice.send",
    { createDdbCommand },
  );
  log("unmarshallAttrs", "info", { result });
  return unmarshall((result as PutItemCommandOutput).Attributes) as ClubDevice;
}

async function handleNoSuchCognitoUser({
  clubId,
  regToken,
  deviceName,
}: CreateClubDeviceInput) {
  // everything else needs the userId, so await its creation
  const { User } = (await lcd(
    cognitoCreateUser(newEmail(regToken), "SUPPRESS"),
    "cognitoCreateUser",
    { clubId, regTokenPublic: regTokenPublicPart(regToken), deviceName },
  )) as AdminCreateUserCommandOutput; // I do not understand why this cast is needed
  const clubDeviceId = User.Username;
  log("User", "debug", { User });
  // the ddbClub creation and remaining userId-dependent promises can be awaited in parallel
  const responses = await Promise.all([
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
    lcd(
      ddbCreateClubDevice(clubId, clubDeviceId, deviceName, regToken),
      "ddbCreateClubDevicePromise",
    ),
  ]);

  return responses[3] as ClubDevice;
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
  ClubDevice
> = async (
  event: AppSyncResolverEvent<MutationCreateClubDeviceArgs>,
): Promise<ClubDevice> => {
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
