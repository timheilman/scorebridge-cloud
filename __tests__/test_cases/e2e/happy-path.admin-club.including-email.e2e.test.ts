import {
  AdminSetUserPasswordCommand,
  AdminSetUserPasswordCommandInput,
} from "@aws-sdk/client-cognito-identity-provider";
import requiredEnvVar from "../../../src/libs/requiredEnvVar";
import { cachedCognitoIdpClient } from "../../../src/libs/cognito";
import {
  anUnknownUserAddsAClubViaApiKey,
  // aUserRemovesHisOwnClub,
} from "../../steps/when";
import {
  userExistsInCognito,
  // userDoesNotExistInCognito,
  userExistsInUsersTable,
  // userDoesNotExistInUsersTable,
  clubExistsInClubsTable,
  // clubDoesNotExistInClubsTable,
} from "../../steps/then";
import { aRandomClubName, aRandomUser } from "../../steps/given";

/* eslint-disable no-undef */
describe("When an unknown user adds a club via API key", () => {
  it("The user and club should be saved in DynamoDB and Cognito", async () => {
    const { password, /* name, */ email } = aRandomUser();
    const newClubName = aRandomClubName();

    const { newUserId, newClubId } = await anUnknownUserAddsAClubViaApiKey(
      email,
      newClubName
    );

    const expectMatchObjectCreatedAt = {
      createdAt: expect.stringMatching(
        /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d(?:\.\d+)?Z?/g
      ),
    };
    const ddbUser = await userExistsInUsersTable(newUserId);
    expect(ddbUser).toMatchObject({
      id: newUserId,
      ...expectMatchObjectCreatedAt,
    });

    const ddbClub = await clubExistsInClubsTable(newClubId);
    expect(ddbClub).toMatchObject({
      id: newClubId,
      name: newClubName,
      ...expectMatchObjectCreatedAt,
    });

    const cognitoUser = await userExistsInCognito(newUserId);
    expect(cognitoUser).toMatchObject({}); // TODO: fix this w/result encountered

    // next is aws sdk equivalent of the aws cli that yan cui shows in ... TODO: lookup that video
    // i.e. accept the auth challenge and provide a new password.
    // can't find that video, but did find this:
    const input: AdminSetUserPasswordCommandInput = {
      // AdminSetUserPasswordRequest
      UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
      Username: newUserId,
      Password: password,
      Permanent: true,
    };
    const command = new AdminSetUserPasswordCommand(input);
    /* const response = */ await cachedCognitoIdpClient().send(command);

    // then: call remove & verify gone.
  });
});
