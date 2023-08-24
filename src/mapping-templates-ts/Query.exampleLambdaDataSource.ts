import { Context } from "@aws-appsync/utils";
import { LambdaRequest } from "@aws-appsync/utils/lib/resolver-return-types";

import { QueryExampleLambdaDataSourceArgs } from "../../appsync";

export const request = function <ARGS>(ctx: Context<ARGS>): LambdaRequest {
  return {
    operation: "Invoke",
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    payload: ctx,
  };
}<QueryExampleLambdaDataSourceArgs>;

export const response = function <ARGS, RESPONSE>(
  ctx: Context<ARGS, object, object, object, RESPONSE>,
) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  return ctx.result;
};
