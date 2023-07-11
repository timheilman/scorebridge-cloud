/* eslint-disable no-undef */
import chance from "chance";
import { anAuthenticatedUser } from "../../steps/given";
import {
  aUserCallsGetMyProfile,
  aUserCallsEditMyProfile,
} from "../../steps/when";

describe("Given an authenticated user", () => {
  let user;
  let profile;
  beforeAll(async () => {
    user = await anAuthenticatedUser();
  });

  it("The user can fetch his profile with getMyProfile", async () => {
    // TODO: fix test FIRST violation of I: Independence; this setting of profile is referenced in next test
    profile = await aUserCallsGetMyProfile(user);

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
    expect(profile.screenName).toContain(firstName);
    expect(profile.screenName).toContain(lastName);
  });
  it("The user can edit his profile with editMyProfile", async () => {
    const newName = chance().first({ nationality: "en" });
    const input = {
      name: newName,
    };
    const newProfile = await aUserCallsEditMyProfile(user, input);

    expect(newProfile).toMatchObject({
      ...profile,
      name: newName,
    });
  });
});
