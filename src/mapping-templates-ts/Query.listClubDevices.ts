import { Context, DynamoDBQueryRequest, util } from "@aws-appsync/utils";

import { QueryListClubDevicesArgs } from "../../scorebridge-ts-submodule/graphql/appsync";
import { errorOnClubMultitenancyFailure } from "./mappingTemplateUtils";

export function request(
  ctx: Context<QueryListClubDevicesArgs>,
): DynamoDBQueryRequest {
  const clubId = ctx.arguments.input.clubId;
  const nextToken = ctx.arguments.input.nextToken ?? undefined;
  const limit = ctx.arguments.input.limit ?? 50;
  errorOnClubMultitenancyFailure(
    clubId,
    ctx,
    "Can only list one's own club's devices",
  );
  if (limit > 50) {
    util.error("Maximum limit is 50", "400: Bad Request");
  }
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
  // I think this might be wrong, because the errors could occur at any
  // part of the array
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  // SCOR-143 changing this from:
  //   return {
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
  //     clubDevices: ctx.result.items,
  //     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access
  //     nextToken: ctx.result.nextToken,
  //   };
  // because the amplify v6 typescript type system needs the list to be named items
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return ctx.result;
};
