import { unmarshall } from "@aws-sdk/util-dynamodb";
import { cognitoDestroyUser } from "@libs/cognito";
import { deleteItemFromTable } from "@libs/ddb";
import { middyWithErrorHandling } from "@libs/lambda";
import { logFn } from "@libs/logging";
import { AppSyncResolverEvent } from "aws-lambda";
import { AppSyncResolverHandler } from "aws-lambda/trigger/appsync-resolver";

import { ClubDevice, MutationDeleteClubDeviceArgs } from "../../../appsync";
import requiredEnvVar from "../../../scorebridge-ts-submodule/requiredEnvVar";
const log = logFn("src.functions.deleteClubDevice.handler.");
// const catPrefix = "src.functions.delete-club-device.handler.";

const almostMain: AppSyncResolverHandler<
  MutationDeleteClubDeviceArgs,
  ClubDevice
> = async (
  event: AppSyncResolverEvent<MutationDeleteClubDeviceArgs>,
): Promise<ClubDevice> => {
  const { clubDeviceId } = event.arguments.input;
  const results = await Promise.all([
    cognitoDestroyUser(clubDeviceId),
    deleteItemFromTable(
      requiredEnvVar("CLUB_DEVICES_TABLE"),
      event.arguments.input,
    ),
  ]);
  log("deleteItemFromTable", "info", { result: results[1] });
  return unmarshall(results[1].Attributes) as ClubDevice;
};
export const main = middyWithErrorHandling(almostMain);
