import { Context } from "@aws-appsync/utils";
import { LambdaRequest } from "@aws-appsync/utils/lib/resolver-return-types";

import { MutationAddClubArgs } from "../../appsync";
import { errorHandlingResponse } from "./mappingTemplateUtils";
export const request = (ctx: Context<MutationAddClubArgs>): LambdaRequest => {
  return {
    operation: "Invoke",
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    payload: ctx,
  };
};
export { errorHandlingResponse as response };
