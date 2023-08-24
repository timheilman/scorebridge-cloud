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
  // #set($clubId = $ctx.arguments.input.clubId)
  const clubId = ctx.arguments.input.clubId;
  const cogIdentity = ctx.identity as AppSyncIdentityCognito;
  // #set($groupsOfMine = $util.defaultIfNull($ctx.identity.claims['cognito:groups'], []))
  const groups = cogIdentity.groups || [];
  // const groups =
  //   (
  //     (ctx.identity as AppSyncIdentityCognito).claims as Record<
  //       string,
  //       string[]
  //     >
  //   )["cognito:groups"] || [];
  // #set($isAdminSuper = $groupsOfMine.contains('adminSuper'))
  const isAdminSuper = groups.includes("adminSuper");
  // #if(!$isAdminSuper && $clubId != $ctx.identity.claims['custom:tenantId'])
  const claims = cogIdentity.claims as Record<string, unknown>;
  if (!isAdminSuper && clubId !== claims["custom:tenantId"]) {
    //   $util.error("Can only remove a club that one is an admin of", "401: Invalid Club Id")
    util.error(
      "Can only remove a club that one is an admin of",
      "401: Invalid Club Id",
    );

    // #else
    //  #if(!$isAdminSuper && $ctx.identity.claims['sub'] != $ctx.arguments.input.userId)
  } else if (!isAdminSuper && cogIdentity.sub != ctx.arguments.input.userId) {
    //    $util.error("Can only remove one's self, not others", "401: Invalid User Id")
    util.error(
      "Can only remove one's self, not others",
      "401: Invalid User Id",
    );
    //  #else
  } else {
    // {
    //     "version": "2018-05-29",
    //     "operation": "Invoke",
    //     "payload": $util.toJson($context)
    // }
    return {
      operation: "Invoke",
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      payload: ctx,
    };
    //   #end
  }
  // #end
}

export const response = lambdaErrorHandlingResponse<
  MutationRemoveClubAndAdminArgs,
  RemoveClubAndAdminResponse
>;
