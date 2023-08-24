import { Context, LambdaRequest, util } from "@aws-appsync/utils";
import { AppSyncIdentityCognito } from "aws-lambda";

import {
  MutationRemoveClubAndAdminArgs,
  RemoveClubAndAdminResponse,
} from "../../appsync";

export function request(
  ctx: Context<MutationRemoveClubAndAdminArgs>,
): LambdaRequest {
  const clubId = ctx.arguments.input.clubId;
  const userId = ctx.arguments.input.userId;
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
    util.error(
      "Can only remove a club that one is an admin of",
      "401: Invalid Club Id",
    );
  } else {
    if (!isAdminSuper && cogIdentity.sub !== userId) {
      util.error(
        "Can only remove one's self, not others",
        "401: Invalid User Id",
      );
    } else {
      return {
        operation: "Invoke",
        payload: ctx,
      };
    }
  }
}

export const response = (
  ctx: Context<
    MutationRemoveClubAndAdminArgs,
    object,
    object,
    object,
    RemoveClubAndAdminResponse
  >,
) => {
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

  return ctx.result;
};
