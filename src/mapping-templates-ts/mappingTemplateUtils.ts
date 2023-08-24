import { Context, LambdaRequest, util } from "@aws-appsync/utils";

export function lambdaPassThroughInvoke<ARGS>(
  ctx: Context<ARGS>,
): LambdaRequest {
  return {
    operation: "Invoke",
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    payload: ctx,
  };
}

export function lambdaErrorHandlingResponse<ARGS, RESPONSE>(
  ctx: Context<
    ARGS,
    object,
    object,
    object,
    RESPONSE & { error?: { message: string; type: string } }
  >,
) {
  if (ctx.result.error) {
    util.error(ctx.result.error.message, ctx.result.error.type);
  }

  return ctx.result;
}
