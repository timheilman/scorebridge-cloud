import { Context, DynamoDBGetItemRequest, util } from "@aws-appsync/utils";

import {
  QueryGetClubArgs,
  QueryListClubDevicesArgs,
} from "../../scorebridge-ts-submodule/graphql/appsync";
import { errorOnClubMultitenancyFailure } from "./mappingTemplateUtils";

export function request(
  ctx: Context<QueryGetClubArgs>,
): DynamoDBGetItemRequest {
  const clubId = ctx.arguments.clubId;
  errorOnClubMultitenancyFailure(clubId, ctx, "Can only get one's own club");
  return {
    operation: "GetItem",
    key: util.dynamodb.toMapValues({ id: clubId }),
  };
}

export const response = (ctx: Context<QueryListClubDevicesArgs>) => {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return ctx.result;
};
