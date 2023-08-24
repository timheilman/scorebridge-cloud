import { AddClubResponse, MutationAddClubArgs } from "../../appsync";
import {
  lambdaErrorHandlingResponse,
  lambdaPassThroughInvoke,
} from "./mappingTemplateUtils";

export const request = lambdaPassThroughInvoke<MutationAddClubArgs>;

export const response = lambdaErrorHandlingResponse<
  MutationAddClubArgs,
  AddClubResponse
>;
