import { Context, util } from "@aws-appsync/utils";

import { AddClubResponse, MutationAddClubArgs } from "../../appsync";
import { logFn } from "../libs/logging";
import { lambdaPassThroughInvoke } from "./mappingTemplateUtils";
const log = logFn("src.mapping-templates-ts.Mutation.addClub.");
export const request = lambdaPassThroughInvoke<MutationAddClubArgs>;

export const response = function <ARGS, RESPONSE>(
  ctx: Context<
    ARGS,
    object,
    object,
    object,
    RESPONSE & { error?: { message: string; type: string } }
  >,
) {
  log("lambdaErrorHandlingResponse.start", "debug", { ctx });
  if (ctx.result.error) {
    util.error(`${ctx.result.error.message}`, `${ctx.result.error.type}`);
  }

  return ctx.result;
}<MutationAddClubArgs, AddClubResponse>;
