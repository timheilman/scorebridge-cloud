import { Context, DynamoDBGetItemRequest } from "@aws-appsync/utils";
import { marshall } from "@aws-sdk/util-dynamodb";

import { QueryGetClubArgs } from "../../appsync";
import { errorOnClubMultitenancyFailure } from "./mappingTemplateUtils";

export function request(
  ctx: Context<QueryGetClubArgs>,
): DynamoDBGetItemRequest {
  const clubId = ctx.arguments.clubId;
  errorOnClubMultitenancyFailure(clubId, ctx, "Can only get one's own club");
  return {
    operation: "GetItem",
    key: marshall({ id: clubId }),
  };
}
export { middyOnErrorHandlingResponse as response } from "./mappingTemplateUtils";
