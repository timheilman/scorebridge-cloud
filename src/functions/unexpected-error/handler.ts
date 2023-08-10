import { middyWithErrorHandling } from "@libs/lambda";
import { AppSyncResolverEvent } from "aws-lambda";
import { AppSyncResolverHandler } from "aws-lambda/trigger/appsync-resolver";

import { UnexpectedErrorResponse } from "../../../appsync";

const almostMain: AppSyncResolverHandler<void, UnexpectedErrorResponse> = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _event: AppSyncResolverEvent<void>,
): Promise<UnexpectedErrorResponse> => {
  return Promise.reject(
    new Error(
      "This error is a synthetic unexpected error from a lambda implementation.",
    ),
  );
};

export const main = middyWithErrorHandling(almostMain);
