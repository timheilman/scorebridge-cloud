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
  util.error("what the ever living fuck");
}

export const response = lambdaErrorHandlingResponse<
  MutationRemoveClubAndAdminArgs,
  RemoveClubAndAdminResponse
>;
