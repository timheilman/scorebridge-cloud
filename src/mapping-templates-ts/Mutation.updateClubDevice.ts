import { Context, DynamoDBUpdateItemRequest, util } from "@aws-appsync/utils";

import { MutationUpdateClubDeviceArgs } from "../../scorebridge-ts-submodule/graphql/appsync";
import { errorOnDeviceLevelMultitenancy } from "./mappingTemplateUtils";

export function request(
  ctx: Context<MutationUpdateClubDeviceArgs>,
): DynamoDBUpdateItemRequest {
  const clubId = ctx.arguments.input.clubId;
  const clubDeviceId = ctx.arguments.input.clubDeviceId;
  errorOnDeviceLevelMultitenancy(ctx, clubId, clubDeviceId);
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
