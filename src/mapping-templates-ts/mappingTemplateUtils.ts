import { Context, util } from "@aws-appsync/utils";
import { LambdaRequest } from "@aws-appsync/utils/lib/resolver-return-types";
import { AppSyncIdentityCognito } from "aws-lambda";

import { MutationUpdateClubDeviceArgs } from "../../scorebridge-ts-submodule/graphql/appsync";

export const passThruLambdaInvokeRequest = (ctx: Context): LambdaRequest => {
  return {
    operation: "Invoke",

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
  if (ctx.result?.error) {
    // @ts-ignore
    util.error(ctx.result.error.message, ctx.result.error.type);
  }
  /* eslint-enable @typescript-eslint/ban-ts-comment,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access */

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return ctx.result;
};

export function getUserDetails<T>(ctx: Context<T>) {
  const cogIdentity = ctx.identity as AppSyncIdentityCognito;
  if (!cogIdentity) {
    util.error("No cogIdentity", "No cogIdentity");
  }
  const groups = cogIdentity.groups || [];
  if (!groups) {
    util.error("No groups", "No groups");
  }
  const isAdminSuper = groups.includes("adminSuper");
  const isAdminClub = groups.includes("adminClub");
  const claims = cogIdentity.claims as Record<string, unknown>;
  if (!claims) {
    util.error("No claims", "No claims");
  }
  return { cogIdentity, isAdminSuper, isAdminClub, claims };
}

export function errorOnClubMultitenancyFailure<T>(
  clubId: string,
  ctx: Context<T>,
  failureMessage: string,
) {
  const { isAdminSuper, claims } = getUserDetails(ctx);
  if (isAdminSuper) {
    return;
  }
  if (!clubId) {
    util.error("No clubId", "No clubId");
  }
  if (clubId !== claims["custom:tenantId"]) {
    util.error(failureMessage, "401: Invalid Club Id");
  }
}

export function errorOnDeviceLevelMultitenancy(
  ctx: Context<MutationUpdateClubDeviceArgs>,
  clubId: string,
  clubDeviceId?: string,
) {
  const { claims, isAdminSuper, isAdminClub } = getUserDetails(ctx);
  if (isAdminSuper) {
    return;
  }

  errorOnClubMultitenancyFailure(
    clubId,
    ctx,
    "Can only subscribe to devices within one's own club",
  );

  if (isAdminClub) {
    return;
  }

  if (!clubDeviceId) {
    util.error(
      "Must specify clubDeviceId with non-admin credentials",
      "401: Invalid Club Device Id",
    );
  }

  if (claims["sub"] && claims["sub"] === clubDeviceId) {
    return;
  }
  util.error("Can only act on one's own club device", "401: Invalid Club Id");
}
