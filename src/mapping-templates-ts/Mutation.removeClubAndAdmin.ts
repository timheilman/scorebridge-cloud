import { Context, LambdaRequest, util } from "@aws-appsync/utils";
import { AppSyncIdentityCognito } from "aws-lambda";

import {
  MutationRemoveClubAndAdminArgs,
  RemoveClubAndAdminResponse,
} from "../../appsync";
import { lambdaErrorHandlingResponse } from "./mappingTemplateUtils";

export function request(
  ctx: Context<MutationRemoveClubAndAdminArgs>,
): LambdaRequest {
  const clubId = ctx.arguments.input.clubId;
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
  } else if (!isAdminSuper && cogIdentity.sub !== ctx.arguments.input.userId) {
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

export const response = lambdaErrorHandlingResponse<
  MutationRemoveClubAndAdminArgs,
  RemoveClubAndAdminResponse
>;
