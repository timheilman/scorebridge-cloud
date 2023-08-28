import { cognitoDestroyUser } from "@libs/cognito";
import { deleteItemFromTable } from "@libs/ddb";
import { middyWithErrorHandling } from "@libs/lambda";
import requiredEnvVar from "@libs/requiredEnvVar";
import { AppSyncResolverEvent } from "aws-lambda";
import { AppSyncResolverHandler } from "aws-lambda/trigger/appsync-resolver";

import {
  DeleteClubDeviceResponse,
  MutationDeleteClubDeviceArgs,
} from "../../../appsync";

// const catPrefix = "src.functions.delete-club-device.handler.";

const almostMain: AppSyncResolverHandler<
  MutationDeleteClubDeviceArgs,
  DeleteClubDeviceResponse
> = async (
  event: AppSyncResolverEvent<MutationDeleteClubDeviceArgs>,
): Promise<DeleteClubDeviceResponse> => {
  const { clubDeviceId } = event.arguments.input;
  await Promise.all([
    cognitoDestroyUser(clubDeviceId),
    deleteItemFromTable(
      requiredEnvVar("CLUB_DEVICES_TABLE"),
      event.arguments.input,
    ),
  ]);
  return { status: "OK" };
};
export const main = middyWithErrorHandling(almostMain);
