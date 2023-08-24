import { Context } from "@aws-appsync/utils";
import { LambdaRequest } from "@aws-appsync/utils/lib/resolver-return-types";

import { UnexpectedErrorResponse } from "../../appsync";

export const request = (ctx: Context<undefined>): LambdaRequest => {
  return {
    operation: "Invoke",
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    payload: ctx,
  };
};

export const response = (
  ctx: Context<undefined, object, object, object, UnexpectedErrorResponse>,
) => {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  return ctx.result;
};
