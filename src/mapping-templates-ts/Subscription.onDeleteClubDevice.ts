import { Context } from "@aws-appsync/utils";

import { errorOnClubMultitenancyFailure } from "./mappingTemplateUtils";

export function request(ctx: Context) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const clubId = ctx.arguments.clubId as string;
  errorOnClubMultitenancyFailure(
    clubId,
    ctx,
    "Can only subscribe to clubDevice deletions from one's own club.",
  );
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
    createdAt: "2023-08-31T18:36:01.738Z",
    updatedAt: "2023-08-31T18:36:01.738Z",
  };
}
