import { Context, util } from "@aws-appsync/utils";
import { LambdaRequest } from "@aws-appsync/utils/lib/resolver-return-types";
import { AppSyncIdentityCognito } from "aws-lambda";

import { QueryListClubDevicesArgs } from "../../appsync";

export const passThruLambdaInvokeRequest = (ctx: Context): LambdaRequest => {
  return {
    operation: "Invoke",
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    payload: ctx,
  };
};

export const middyOnErrorHandlingResponse = (ctx: Context) => {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  // this happens due to middy error handling middleware per Yan Cui
  /* eslint-disable @typescript-eslint/ban-ts-comment,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access */
  // @ts-ignore
  if (ctx.result.error) {
    // @ts-ignore
    util.error(ctx.result.error.message, ctx.result.error.type);
  }
  /* eslint-enable @typescript-eslint/ban-ts-comment,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access */

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return ctx.result;
};

export function errorOnClubMultitenancyFailure<T>(
  clubId: string,
  ctx: Context<T>,
  failureMessage: string,
) {
  if (!clubId) {
    util.error("No clubId", "No clubId");
  }
  const cogIdentity = ctx.identity as AppSyncIdentityCognito;
  if (!cogIdentity) {
    util.error("No cogIdentity", "No cogIdentity");
  }
  const groups = cogIdentity.groups || [];
  if (!groups) {
    util.error("No groups", "No groups");
  }
  const isAdminSuper = groups.includes("adminSuper");
  const claims = cogIdentity.claims as Record<string, unknown>;
  if (!claims) {
    util.error("No claims", "No claims");
  }
  if (!isAdminSuper && clubId !== claims["custom:tenantId"]) {
    util.error(failureMessage, "401: Invalid Club Id");
  }
  return { isAdminSuper, cogIdentity };
}
