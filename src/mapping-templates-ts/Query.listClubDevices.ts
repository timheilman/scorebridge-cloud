import { Context, DynamoDBQueryRequest, util } from "@aws-appsync/utils";

import { ListClubDevicesOutput, QueryListClubDevicesArgs } from "../../appsync";
import { errorOnClubMultitenancyFailure } from "./mappingTemplateUtils";

export function request(
  ctx: Context<QueryListClubDevicesArgs>,
): DynamoDBQueryRequest {
  const clubId = ctx.arguments.input.clubId;
  const nextToken = ctx.arguments.input.nextToken;
  const limit = ctx.arguments.input.limit;
  errorOnClubMultitenancyFailure(
    clubId,
    ctx,
    "Can only list one's own club's devices",
  );
  return {
    operation: "Query",
    query: {
      expression: "clubId = :clubId",
      expressionValues: util.dynamodb.toMapValues({
        ":clubId": clubId,
      }),
    },
    nextToken,
    limit,
    scanIndexForward: false,
    consistentRead: false,
    select: "ALL_ATTRIBUTES",
  };
}

export const response = (ctx: Context<QueryListClubDevicesArgs>) => {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  const output: ListClubDevicesOutput = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    clubDevices: ctx.result.items,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
    nextToken: ctx.result.nextToken,
  };
  return output;
};
