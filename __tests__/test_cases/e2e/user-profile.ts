import { anAuthenticatedUser } from "../../steps/given";
import { aUserCallsGetMyProfile } from "../../steps/when";

// eslint-disable-next-line no-undef
describe("Given an authenticated user", () => {
  let user;
  // eslint-disable-next-line no-undef
  beforeAll(async () => {
    user = await anAuthenticatedUser();
  });

  // eslint-disable-next-line no-undef
  it("The user can fetch his profile with getMyProfile", async () => {
    const profile = await aUserCallsGetMyProfile(user);

    // eslint-disable-next-line no-undef
    expect(profile).toMatchObject({
      id: user.username,
      name: user.name,
      imageUrl: null,
      backgroundImageUrl: null,
      bio: null,
      location: null,
      website: null,
      birthdate: null,
      createdAt: expect.stringMatching(
        /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?/g
      ),
      // tweets
      followersCount: null,
      followingCount: null,
      tweetsCount: null,
      likesCounts: null,
    });

    const [firstName, lastName] = profile.name.split(" ");
    // eslint-disable-next-line no-undef
    expect(profile.screenName).toContain(firstName);
    // eslint-disable-next-line no-undef
    expect(profile.screenName).toContain(lastName);
  });
});
