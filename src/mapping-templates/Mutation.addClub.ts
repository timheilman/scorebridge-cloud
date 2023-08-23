import { Context, LambdaRequest, util } from "@aws-appsync/utils";

import { AddClubResponse, MutationAddClubArgs } from "../../appsync";

export function request(ctx: Context<MutationAddClubArgs>): LambdaRequest {
  return {
    operation: "Invoke",
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    payload: ctx,
  };
}

export function response(
  ctx: Context<
    MutationAddClubArgs,
    object,
    object,
    object,
    AddClubResponse & { error?: { message: string; type: string } }
  >,
) {
  if (ctx.result.error) {
    util.error(ctx.result.error.message, ctx.result.error.type);
  }

  return ctx.result;
}
