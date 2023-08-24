import { Context } from "@aws-appsync/utils";

export const response = (ctx: Context) => {
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return ctx.result;
};
