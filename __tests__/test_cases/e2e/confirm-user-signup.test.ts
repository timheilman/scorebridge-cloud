import { aUserSignsUp } from "../../steps/when";
import { userExistsInUsersTable } from "../../steps/then";
import { aRandomUser } from "../../steps/given";

/* eslint-disable no-undef */
describe("When a user signs up", () => {
  it("The user's profile should be saved in DynamoDB", async () => {
    const { password, name, email } = aRandomUser();

    const user = await aUserSignsUp(password, name, email);

    const ddbUser = await userExistsInUsersTable(user.username);
    expect(ddbUser).toMatchObject({
      id: user.username,
      name,
      createdAt: expect.stringMatching(
        /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?/g
      ),
      // followersCount: 0,
      // followingCount: 0,
      // tweetsCount: 0,
      // likesCounts: 0,
    });

    const [firstName, lastName] = name.split(" ");
    expect(ddbUser.screenName).toContain(firstName);
    expect(ddbUser.screenName).toContain(lastName);
  });
});
