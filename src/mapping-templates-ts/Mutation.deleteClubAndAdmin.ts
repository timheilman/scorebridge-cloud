import { Context, LambdaRequest, util } from "@aws-appsync/utils";

import { MutationDeleteClubAndAdminArgs } from "../../scorebridge-ts-submodule/graphql/appsync";
import { errorOnClubMultitenancyFailure } from "./mappingTemplateUtils";
export { middyOnErrorHandlingResponse as response } from "./mappingTemplateUtils";

export function request(
  ctx: Context<MutationDeleteClubAndAdminArgs>,
): LambdaRequest {
  const clubId = ctx.arguments.input.clubId;
  const userId = ctx.arguments.input.userId;

  const { isAdminSuper, cogIdentity } = errorOnClubMultitenancyFailure(
    clubId,
    ctx,
    "Can only remove a club that one is an admin of",
  );
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
