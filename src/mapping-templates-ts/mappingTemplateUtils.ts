import { Context, LambdaRequest, util } from "@aws-appsync/utils";

import { logFn } from "../libs/logging";
const log = logFn("src.mapping-templates-ts.mappingTemplateUtils.");
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
  ctx: Context<ARGS, object, object, object, RESPONSE>,
) {
  log("lambdaErrorHandlingResponse.start", "debug", { ctx });
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  return ctx.result;
}
