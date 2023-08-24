import { Context } from "@aws-appsync/utils";
import { LambdaRequest } from "@aws-appsync/utils/lib/resolver-return-types";

import {
  ExampleLambdaDataSourceOutput,
  QueryExampleLambdaDataSourceArgs,
} from "../../appsync";

export const request = (
  ctx: Context<QueryExampleLambdaDataSourceArgs>,
): LambdaRequest => {
  return {
    operation: "Invoke",
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    payload: ctx,
  };
};

export const response = (
  ctx: Context<
    QueryExampleLambdaDataSourceArgs,
    object,
    object,
    object,
    ExampleLambdaDataSourceOutput
  >,
) => {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  return ctx.result;
};
