import {
  AdminGetUserCommandOutput,
  AdminSetUserPasswordCommand,
  AdminSetUserPasswordCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import requiredEnvVar from "../../../src/libs/requiredEnvVar";
import { cachedCognitoIdpClient } from "../../../src/libs/cognito";
import {
  anUnknownUserAddsAClubViaApiKey,
  aUserCallsRemoveClubAndAdmin,
} from "../../steps/when";
import {
  userExistsInCognito,
  userDoesNotExistInCognito,
  userExistsInUsersTable,
  userDoesNotExistInUsersTable,
  clubExistsInClubsTable,
  clubDoesNotExistInClubsTable,
} from "../../steps/then";
import { aLoggedInUser, aRandomClubName, aRandomUser } from "../../steps/given";

function cognitoUserAttributeValue(
  cognitoUser: AdminGetUserCommandOutput,
  attributeKey: string,
) {
  return cognitoUser.UserAttributes.find((a) => a.Name === attributeKey).Value;
}

const timestampFormat =
  /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?/g;
describe("When an unknown user adds a club via API key", () => {
  let password;
  let email;
  let clubName;
  let userId;
  let clubId;
  it("The user and club should be saved in DynamoDB and Cognito", async () => {
    const user = aRandomUser();
    password = user.password;
    email = user.email;
    clubName = aRandomClubName();

    const result = await anUnknownUserAddsAClubViaApiKey(email, clubName);
    userId = result.newUserId;
    clubId = result.newClubId;

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
  it("Then removing the club (and user) via normal login succeeds in cognito and ddb", async () => {
    const { accessToken } = await aLoggedInUser(email, password);
    const result = await aUserCallsRemoveClubAndAdmin(
      userId,
      clubId,
      accessToken,
    );
    expect(result.status).toEqual("OK");
    await userDoesNotExistInCognito(userId);
    await userDoesNotExistInUsersTable(userId);
    await clubDoesNotExistInClubsTable(clubId);
  });
});
