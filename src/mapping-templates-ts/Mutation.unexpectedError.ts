import { UnexpectedErrorResponse } from "../../appsync";
import {
  lambdaErrorHandlingResponse,
  lambdaPassThroughInvoke,
} from "./mappingTemplateUtils";

export const request = lambdaPassThroughInvoke<undefined>;

export const response = lambdaErrorHandlingResponse<
  undefined,
  UnexpectedErrorResponse
>;
