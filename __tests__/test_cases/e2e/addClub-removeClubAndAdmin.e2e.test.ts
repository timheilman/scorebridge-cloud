import {
  AdminSetUserPasswordCommand,
  AdminSetUserPasswordCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";

import { cachedCognitoIdpClient } from "../../../src/libs/cognito";
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
  anUnknownUserCallsRemoveClubAndAdmin,
  aUserCallsAddClub,
  aUserCallsRemoveClubAndAdmin,
} from "../../steps/when";

const timestampFormat =
  /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?/g;
describe("When an unknown user adds a club via API key", () => {
  let password: string;
  let email: string;
  let clubName: string;
  let userId: string;
  let clubId: string;

  async function verifyAddUserBackendEffects() {
    const result = await anUnknownUserAddsAClubViaApiKey(email, clubName);
    userId = result.userId;
    clubId = result.clubId;

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
    expect(cognitoUser.UserStatus).toEqual("FORCE_CHANGE_PASSWORD");
    expect(cognitoUser.UserCreateDate.toJSON()).toMatch(timestampFormat);
  }

  it("The user and club should be saved in DynamoDB and Cognito", async () => {
    const user = aRandomUser();
    password = user.password;
    email = user.email;
    clubName = aRandomClubName();
    await verifyAddUserBackendEffects();
  });
  it("Once the user resets their password their status changes to CONFIRMED", async () => {
    const input: AdminSetUserPasswordCommandInput = {
      // AdminSetUserPasswordRequest
      UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
      Username: userId,
      Password: password,
      Permanent: true,
    };
    const command = new AdminSetUserPasswordCommand(input);
    /* const response = */ await cachedCognitoIdpClient().send(command);

    const cognitoUserPasswordChanged = await userExistsInCognito(userId);
    expect(cognitoUserPasswordChanged.UserStatus).toEqual("CONFIRMED");
  });
  it("but cannot call addClub", async () => {
    const { idToken } = await aLoggedInUser(email, password);
    try {
      await aUserCallsAddClub(email, clubName, idToken);
      throw new Error("failed");
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(e.message).toContain(
        "Not Authorized to access addClub on type Mutation",
      );
    }
  });
  it("nor can call removeClubAndAdmin with the API key", async () => {
    try {
      await anUnknownUserCallsRemoveClubAndAdmin(userId, clubId);
      throw new Error("failed");
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(e.message).toContain(
        "Not Authorized to access removeClubAndAdmin on type Mutation",
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
    const result = await aUserCallsRemoveClubAndAdmin(userId, clubId, idToken);
    expect(result.status).toEqual("OK");
    await verifyUserGone();
  });
  it("But also adminSuper is permitted to removeClubAndAdmin", async () => {
    const { idToken } = await aLoggedInAdminSuper();
    const { userId, clubId } = await anUnknownUserAddsAClubViaApiKey(
      email,
      clubName,
    );
    const actual = await aUserCallsRemoveClubAndAdmin(userId, clubId, idToken);
    expect(actual.status).toEqual("OK");
    await verifyUserGone();
  });
  it("Whereas a clubAdmin of a different club is not permitted", async () => {
    const { idToken } = await aLoggedInAdminClub();
    const { userId, clubId } = await anUnknownUserAddsAClubViaApiKey(
      email,
      clubName,
    );
    try {
      await aUserCallsRemoveClubAndAdmin(userId, clubId, idToken);
      throw new Error("failed");
    } catch (e) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(e.message).toContain("sdfaks");
    }
    await verifyAddUserBackendEffects();
  });
});
