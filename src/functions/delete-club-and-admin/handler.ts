import { cognitoDestroyUser } from "@libs/cognito";
import { deleteItemFromSimpleIdTable } from "@libs/ddb";
import { middyWithErrorHandling } from "@libs/lambda";
import { logFn } from "@libs/logging";
import { AppSyncResolverEvent } from "aws-lambda";
import { AppSyncResolverHandler } from "aws-lambda/trigger/appsync-resolver";

import {
  DeleteClubAndAdminResponse,
  MutationDeleteClubAndAdminArgs,
} from "../../../scorebridge-ts-submodule/graphql/appsync";
import { logCompletionDecoratorFactory } from "../../../scorebridge-ts-submodule/logCompletionDecorator";
import requiredEnvVar from "../../../scorebridge-ts-submodule/requiredEnvVar";

const log = logFn("src.functions.delete-club-and-admin.handler.");
const lcd = logCompletionDecoratorFactory(log);

const almostMain: AppSyncResolverHandler<
  MutationDeleteClubAndAdminArgs,
  DeleteClubAndAdminResponse
> = async (
  event: AppSyncResolverEvent<MutationDeleteClubAndAdminArgs>,
): Promise<DeleteClubAndAdminResponse> => {
  const { clubId } = event.arguments.input;
  const promises: Promise<unknown>[] = [];
  promises.push(
    lcd(
      cognitoDestroyUser(event.arguments.input.userId),
      "cognitoDestroyUser",
      { userId: event.arguments.input.userId },
    ),
  );

  promises.push(
    lcd(
      deleteItemFromSimpleIdTable(
        requiredEnvVar("USERS_TABLE"),
        event.arguments.input.userId,
      ),
      "deleteItemFromTable",
      { userId: event.arguments.input.userId },
    ),
  );
  log("main.ddbUserDeletion.success", "debug");

  promises.push(
    lcd(
      deleteItemFromSimpleIdTable(requiredEnvVar("CLUBS_TABLE"), clubId),
      "deleteItemFromTable",
      { clubId },
    ),
  );
  await Promise.all(promises);

  return {
    status: "OK",
  };
};
export const main = middyWithErrorHandling(almostMain);
