import {
  AdminSetUserPasswordCommand,
  AdminSetUserPasswordCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";

import { cognitoClient } from "../../../src/libs/cognito";
import { logFn } from "../../../src/libs/logging";
import requiredEnvVar from "../../../src/libs/requiredEnvVar";
import { cognitoUserAttributeValue } from "../../lib/cognito";
import {
  aLoggedInAdminClub,
  aLoggedInAdminSuper,
  aLoggedInUser,
  aRandomClubName,
  aRandomUser,
} from "../../steps/given";
import {
  clubDoesNotExistInClubsTable,
  clubExistsInClubsTable,
  userDoesNotExistInCognito,
  userDoesNotExistInUsersTable,
  userExistsInCognito,
  userExistsInUsersTable,
} from "../../steps/then";
import {
  anUnknownUserAddsAClubViaApiKey,
  anUnknownUserCallsDeleteClubAndAdmin,
  aUserCallsCreateClub,
  aUserCallsDeleteClubAndAdmin,
} from "../../steps/when";
const log = logFn("__tests__/test_cases/e2e/createClub-deleteClubAndAdmin.");

const timestampFormat =
  /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?/g;
describe("When an unknown user adds a club via API key", () => {
  let password: string;
  let email: string;
  let clubName: string;
  let userId: string;
  let clubId: string;

  async function verifyCreateUserBackendEffects(expectedUserStatus: string) {
    const ddbUser = await userExistsInUsersTable(userId);
    expect(ddbUser.id).toBe(userId);
    expect(ddbUser.email).toBe(email);
    expect(ddbUser.createdAt).toMatch(timestampFormat);

    const ddbClub = await clubExistsInClubsTable(clubId);
    expect(ddbClub.id).toBe(clubId);
    expect(ddbClub.name).toBe(clubName);
    expect(ddbClub.createdAt).toMatch(timestampFormat);

    const cognitoUser = await userExistsInCognito(userId);
    expect(cognitoUserAttributeValue(cognitoUser, "custom:tenantId")).toEqual(
      clubId,
    );
    expect(cognitoUserAttributeValue(cognitoUser, "email")).toEqual(email);
    expect(cognitoUser.Username).toEqual(userId);
    expect(cognitoUser.UserStatus).toEqual(expectedUserStatus);
    expect(cognitoUser.UserCreateDate.toJSON()).toMatch(timestampFormat);
  }

  it("The user and club should be saved in DynamoDB and Cognito", async () => {
    const user = aRandomUser();
    password = user.password;
    email = user.email;
    clubName = aRandomClubName();
    const result = await anUnknownUserAddsAClubViaApiKey(email, clubName);
    userId = result.userId;
    clubId = result.clubId;
    await verifyCreateUserBackendEffects("FORCE_CHANGE_PASSWORD");
  });

  async function updatePassword() {
    const input: AdminSetUserPasswordCommandInput = {
      // AdminSetUserPasswordRequest
      UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
      Username: userId,
      Password: password,
      Permanent: true,
    };
    const command = new AdminSetUserPasswordCommand(input);
    /* const response = */
    await cognitoClient().send(command);
  }

  it("Once the user resets their password their status changes to CONFIRMED", async () => {
    await updatePassword();

    const cognitoUserPasswordChanged = await userExistsInCognito(userId);
    expect(cognitoUserPasswordChanged.UserStatus).toEqual("CONFIRMED");
  });
  it("but cannot call createClub", async () => {
    const { idToken } = await aLoggedInUser(email, password);
    try {
      await aUserCallsCreateClub(email, clubName, idToken);
      throw new Error("failed");
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(e.message).toContain(
        "Not Authorized to access createClub on type Mutation",
      );
    }
  });
  it("nor can call deleteClubAndAdmin with the API key", async () => {
    try {
      await anUnknownUserCallsDeleteClubAndAdmin(userId, clubId);
      throw new Error("failed");
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(e.message).toContain(
        "Not Authorized to access deleteClubAndAdmin on type Mutation",
      );
    }
  });

  async function verifyUserGone() {
    await userDoesNotExistInCognito(userId);
    await userDoesNotExistInUsersTable(userId);
    await clubDoesNotExistInClubsTable(clubId);
  }

  it("Then removing the club (and user) via normal login succeeds in cognito and ddb", async () => {
    const { idToken } = await aLoggedInUser(email, password);
    const result = await aUserCallsDeleteClubAndAdmin(userId, clubId, idToken);
    expect(result.status).toEqual("OK");
    await verifyUserGone();
  });
  it("Whereas a clubAdmin of a different club is not permitted", async () => {
    const { idToken } = await aLoggedInAdminClub();
    const result = await anUnknownUserAddsAClubViaApiKey(email, clubName);
    userId = result.userId;
    clubId = result.clubId;
    try {
      await aUserCallsDeleteClubAndAdmin(userId, clubId, idToken);
      throw new Error("failed");
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(e.message).toContain(
        "Can only remove a club that one is an admin of",
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(e.message).toContain("401: Invalid Club Id");
    }
    await verifyCreateUserBackendEffects("FORCE_CHANGE_PASSWORD");
  });
  it("But an adminSuper is permitted to deleteClubAndAdmin", async () => {
    const { idToken } = await aLoggedInAdminSuper();
    const actual = await aUserCallsDeleteClubAndAdmin(userId, clubId, idToken);
    expect(actual.status).toEqual("OK");
    await verifyUserGone();
  });
  it("Sneaky sneaky, if the clubId matches but the userId does not, should fail", async () => {
    const userResult = aRandomUser();
    email = userResult.email;
    password = userResult.password;
    log("sneaky random user", "debug", { userResult });
    clubName = aRandomClubName();
    const result = await anUnknownUserAddsAClubViaApiKey(email, clubName);
    userId = result.userId;
    clubId = result.clubId;
    await updatePassword();
    const { idToken } = await aLoggedInUser(email, password);
    try {
      await aUserCallsDeleteClubAndAdmin("Some_other_UserID", clubId, idToken);
      throw new Error("failed");
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(e.message).toContain("Can only remove one's self, not others");
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(e.message).toContain("401: Invalid User Id");
    }
    await verifyCreateUserBackendEffects("CONFIRMED");
    // cleanup:
    const actual = await aUserCallsDeleteClubAndAdmin(userId, clubId, idToken);
    expect(actual.status).toEqual("OK");
    await verifyUserGone();
  });
});
