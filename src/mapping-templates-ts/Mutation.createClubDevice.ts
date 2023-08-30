import { Context, LambdaRequest } from "@aws-appsync/utils";

import { MutationCreateClubDeviceArgs } from "../../appsync";
import { errorOnClubMultitenancyFailure } from "./mappingTemplateUtils";

export { middyOnErrorHandlingResponse as response } from "./mappingTemplateUtils";
export function request(
  ctx: Context<MutationCreateClubDeviceArgs>,
): LambdaRequest {
  const clubId = ctx.arguments.input.clubId;
  errorOnClubMultitenancyFailure(
    clubId,
    ctx,
    "Can only create club devices for one's own club.",
  );
  return {
    operation: "Invoke",
    payload: ctx,
  };
}
