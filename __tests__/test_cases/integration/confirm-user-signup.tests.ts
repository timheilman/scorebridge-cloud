import { Chance } from "chance";
// eslint-disable-next-line import/extensions,import/no-unresolved
import { aRandomUser } from "../../steps/given";
// eslint-disable-next-line import/extensions,import/no-unresolved
import { weInvokeConfirmUserSignup } from "../../steps/when";
// eslint-disable-next-line import/extensions,import/no-unresolved
import { userExistsInUsersTable } from "../../steps/then";

const chance = new Chance();
// eslint-disable-next-line no-undef
describe("When confirmUserSignup runs", () => {
  // eslint-disable-next-line no-undef
  it("The user's profile should be saved in DynamoDB", async () => {
    const { name, email } = aRandomUser();
    const username = chance.guid();

    await weInvokeConfirmUserSignup(username, name, email);

    const ddbUser = await userExistsInUsersTable(username);
    // eslint-disable-next-line no-undef
    expect(ddbUser).toMatchObject({
      id: username,
      name,
      // eslint-disable-next-line no-undef
      createdAt: expect.stringMatching(
        /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?/g
      ),
      // followersCount: 0,
      // followingCount: 0,
      // tweetsCount: 0,
      // likesCounts: 0,
    });

    const [firstName, lastName] = name.split(" ");
    // eslint-disable-next-line no-undef
    expect(ddbUser.screenName).toContain(firstName);
    // eslint-disable-next-line no-undef
    expect(ddbUser.screenName).toContain(lastName);
  });
});
