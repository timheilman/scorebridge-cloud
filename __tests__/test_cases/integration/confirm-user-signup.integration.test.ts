import { Chance } from "chance";

import { aRandomUser } from "../../steps/given";
import { userExistsInUsersTable } from "../../steps/then";
import { weInvokeConfirmUserSignup } from "../../steps/when";

const chance = new Chance();

describe("When confirmUserSignup runs", () => {
  it("The user's profile should be saved in DynamoDB", async () => {
    const { name, email } = aRandomUser();
    const username = chance.guid();

    await weInvokeConfirmUserSignup(username, name, email);

    const ddbUser = await userExistsInUsersTable(username);
    expect(ddbUser).toMatchObject({
      id: username,
      name,
      createdAt: expect.stringMatching(
        /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?/g,
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
