import { Context, LambdaRequest } from "@aws-appsync/utils";

import { MutationDeleteClubDeviceArgs } from "../../scorebridge-ts-submodule/graphql/appsync";
import { errorOnClubMultitenancyFailure } from "./mappingTemplateUtils";

export { middyOnErrorHandlingResponse as response } from "./mappingTemplateUtils";
export function request(
  ctx: Context<MutationDeleteClubDeviceArgs>,
): LambdaRequest {
  const clubId = ctx.arguments.input.clubId;
  errorOnClubMultitenancyFailure(
    clubId,
    ctx,
    "Can only delete club devices for one's own club.",
  );
  return {
    operation: "Invoke",
    payload: ctx,
  };
}
