import { Context, DynamoDBUpdateItemRequest, util } from "@aws-appsync/utils";

import { MutationUpdateClubArgs } from "../../scorebridge-ts-submodule/graphql/appsync";
import { errorOnClubMultitenancyFailure } from "./mappingTemplateUtils";

export function request(
  ctx: Context<MutationUpdateClubArgs>,
): DynamoDBUpdateItemRequest {
  const clubId = ctx.arguments.input.id;
  errorOnClubMultitenancyFailure(clubId, ctx, "Can only update one's own club");
  return {
    operation: "UpdateItem",
    update: {
      expression: "SET #name = :name",
      expressionNames: { "#name": "name" },
      expressionValues: util.dynamodb.toMapValues({
        ":name": ctx.arguments.input.name,
      }),
    },
    key: util.dynamodb.toMapValues({ id: clubId }),
  };
}

export const response = (ctx: Context<MutationUpdateClubArgs>) => {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return ctx.result;
};
