// eslint-disable-next-line import/no-unresolved,import/extensions
import { aUserSignsUp } from "../../steps/when";
// eslint-disable-next-line import/no-unresolved,import/extensions
import { userExistsInUsersTable } from "../../steps/then";
// eslint-disable-next-line import/no-unresolved,import/extensions
import { aRandomUser } from "../../steps/given";

// eslint-disable-next-line no-undef
describe("When a user signs up", () => {
  // eslint-disable-next-line no-undef
  it("The user's profile should be saved in DynamoDB", async () => {
    const { password, name, email } = aRandomUser();

    const user = await aUserSignsUp(password, name, email);

    const ddbUser = await userExistsInUsersTable(user.username);
    // eslint-disable-next-line no-undef
    expect(ddbUser).toMatchObject({
      id: user.username,
      name,
      // eslint-disable-next-line no-undef
      createdAt: expect.stringMatching(
        /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?/g
      ),
      followersCount: 0,
      followingCount: 0,
      tweetsCount: 0,
      likesCounts: 0,
    });

    const [firstName, lastName] = name.split(" ");
    // eslint-disable-next-line no-undef
    expect(ddbUser.screenName).toContain(firstName);
    // eslint-disable-next-line no-undef
    expect(ddbUser.screenName).toContain(lastName);
  });
});
