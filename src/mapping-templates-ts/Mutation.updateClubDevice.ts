import { Context, DynamoDBUpdateItemRequest, util } from "@aws-appsync/utils";

import { MutationUpdateClubDeviceArgs } from "../../scorebridge-ts-submodule/graphql/appsync";
import {
  errorOnClubMultitenancyFailure,
  getUserDetails,
} from "./mappingTemplateUtils";

export function request(
  ctx: Context<MutationUpdateClubDeviceArgs>,
): DynamoDBUpdateItemRequest {
  const clubId = ctx.arguments.input.clubId;
  const clubDeviceId = ctx.arguments.input.clubDeviceId;
  const { claims } = getUserDetails(ctx);
  errorOnClubMultitenancyFailure(
    clubId,
    ctx,
    "Can only update devices within one's own club",
  );
  if (!(claims["sub"] && claims["sub"] === clubDeviceId)) {
    util.error("Can only update one's own club device", "401: Invalid Club Id");
  }
  return {
    operation: "UpdateItem",
    update: {
      expression: "SET #table = :table, updatedAt = :updatedAt",
      expressionNames: { "#table": "table" },
      expressionValues: util.dynamodb.toMapValues({
        ":table": ctx.arguments.input.table,
        ":updatedAt": util.time.nowISO8601(),
      }),
    },
    key: util.dynamodb.toMapValues({ clubId, clubDeviceId }),
  };
}

export const response = (ctx: Context<MutationUpdateClubDeviceArgs>) => {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return ctx.result;
};
