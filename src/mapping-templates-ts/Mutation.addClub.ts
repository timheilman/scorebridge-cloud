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

const responseTempl = <ARGS, OUTPUT>(
  ctx: Context<ARGS, object, object, object, OUTPUT>,
) => {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  // this happens due to middy error handling middleware per Yan Cui
  /* eslint-disable @typescript-eslint/ban-ts-comment,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access */
  // @ts-ignore
  if (ctx.result.error) {
    // @ts-ignore
    util.error(ctx.result.error.message, ctx.result.error.type);
  }
  /* eslint-enable @typescript-eslint/ban-ts-comment,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access */

  return ctx.result;
};
const response = responseTempl<MutationAddClubArgs, AddClubResponse>;
// The only thing changing is the implicit name of the function, so this should fix it
Object.defineProperty(response, "name", { value: "response" });
export { response };
