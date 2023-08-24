import { Context, LambdaRequest, util } from "@aws-appsync/utils";

import {
  MutationRemoveClubAndAdminArgs,
  RemoveClubAndAdminResponse,
} from "../../appsync";
import { lambdaErrorHandlingResponse } from "./mappingTemplateUtils";

export function request(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _ctx: Context<MutationRemoveClubAndAdminArgs>,
): LambdaRequest {
  util.error("Does Util.error work at all?", "what the hell");
}

export const response = lambdaErrorHandlingResponse<
  MutationRemoveClubAndAdminArgs,
  RemoveClubAndAdminResponse
>;
