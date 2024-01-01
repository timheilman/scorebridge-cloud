import { Context } from "@aws-appsync/utils";

import { errorOnDeviceLevelMultitenancy } from "./mappingTemplateUtils";

export function request(ctx: Context) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const clubId = ctx.arguments.clubId as string;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const clubDeviceId = ctx.arguments.clubDeviceId as string;
  errorOnDeviceLevelMultitenancy(ctx, clubId, clubDeviceId);
  return {
    payload: ctx,
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function response(ctx: Context) {
  return {
    clubId: "fake",
    clubDeviceId: "fake",
    email: "fake@email.com",
    name: "fake name",
    table: 0,
    createdAt: "2023-08-31T18:36:01.738Z",
    updatedAt: "2023-08-31T18:36:01.738Z",
  };
}
