import { aLoggedInAdminClub } from "../../steps/given";
import {
  anUnknownUserCallsUnexpectedError,
  aUserCallsUnexpectedError,
} from "../../steps/when";

describe("visits to unexpected_error", () => {
  it("API_KEY is not authorized", async () => {
    try {
      await anUnknownUserCallsUnexpectedError();
      throw new Error("failed");
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(e.message).toContain(
        "Not Authorized to access unexpectedError on type Mutation",
      );
    }
  });
  it("club admins are not authorized", async () => {
    const { idToken } = await aLoggedInAdminClub();
    try {
      await aUserCallsUnexpectedError(idToken);
      throw new Error("failed");
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(e.message).toContain(
        "Not Authorized to access unexpectedError on type Mutation",
      );
    }
  });
  // happy-path for adminSuper tested as part of cypress
});
