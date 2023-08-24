import { Context } from "@aws-appsync/utils";
import { LambdaRequest } from "@aws-appsync/utils/lib/resolver-return-types";

import { AddClubResponse, MutationAddClubArgs } from "../../appsync";

export const request = (ctx: Context<MutationAddClubArgs>): LambdaRequest => {
  return {
    operation: "Invoke",
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    payload: ctx,
  };
};

export const response = (
  ctx: Context<MutationAddClubArgs, object, object, object, AddClubResponse>,
) => {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  return ctx.result;
};
