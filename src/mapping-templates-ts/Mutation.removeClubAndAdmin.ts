import { Context, LambdaRequest, util } from "@aws-appsync/utils";

import {
  MutationRemoveClubAndAdminArgs,
  RemoveClubAndAdminResponse,
} from "../../appsync";

export function request(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _ctx: Context<MutationRemoveClubAndAdminArgs>,
): LambdaRequest {
  util.error("what the ever living fuck");
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

  return ctx.result;
};
