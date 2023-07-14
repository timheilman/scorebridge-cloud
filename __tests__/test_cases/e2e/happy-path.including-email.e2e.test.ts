// import { anUnknownUserAddsAClubViaApiKey } from "../../steps/when";
// import {
//   // userExistsInCognito,
//   // userDoesNotExistInCognito,
//   userExistsInUsersTable,
//   // userDoesNotExistInUsersTable,
//   // clubExistsInClubsTable,
//   // clubDoesNotExistInClubsTable,
// } from "../../steps/then";
// import { aRandomUser } from "../../steps/given";
//
// /* eslint-disable no-undef */
// describe("When an unknown user adds a club via API key", () => {
//   xit("The user and club should be saved in DynamoDB and Cognito", async () => {
//     const { password, name, email } = aRandomUser();
//
//     // TODO: left off in a top-down through this file to convert to usage of marshall for weird S: stuff
//     const user = await anUnknownUserAddsAClubViaApiKey(password, name, email);
//
//     const ddbUser = await userExistsInUsersTable(user.username);
//     expect(ddbUser).toMatchObject({
//       id: user.username,
//       createdAt: expect.stringMatching(
//         /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?/g
//       ),
//       // followersCount: 0,
//       // followingCount: 0,
//       // tweetsCount: 0,
//       // likesCounts: 0,
//     });
//
//     const [firstName, lastName] = name.split(" ");
//     expect(ddbUser.screenName).toContain(firstName);
//     expect(ddbUser.screenName).toContain(lastName);
//   });
// });
