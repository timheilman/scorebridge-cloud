import { Context, DynamoDBGetItemRequest, util } from "@aws-appsync/utils";

import { QueryGetClubDeviceArgs } from "../../scorebridge-ts-submodule/graphql/appsync";
import { errorOnDeviceLevelMultitenancy } from "./mappingTemplateUtils";

export function request(
  ctx: Context<QueryGetClubDeviceArgs>,
): DynamoDBGetItemRequest {
  const clubId = ctx.arguments.clubId;
  const clubDeviceId = ctx.arguments.clubDeviceId;
  errorOnDeviceLevelMultitenancy(ctx, clubId, clubDeviceId);
  return {
    operation: "GetItem",
    key: util.dynamodb.toMapValues({ clubId, clubDeviceId }),
  };
}

export const response = (ctx: Context<QueryGetClubDeviceArgs>) => {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return ctx.result;
};
