import { config as dotenvConfig } from "dotenv";

import {
  CreateClubResponse,
  DeleteClubAndAdminResponse,
  UnexpectedErrorResponse,
} from "../../scorebridge-ts-submodule/graphql/appsync";
import { logFn } from "../../src/libs/logging";
import requiredEnvVar from "../../src/libs/requiredEnvVar";
import GraphQL from "../lib/graphql";

const log = logFn("__tests__.steps.when.");
dotenvConfig();

const createClubGql = `mutation createClub($input: CreateClubInput!) {
    createClub(input: $input) {
      clubId
      userId
    }
  }`;
const deleteClubAndAdminGql = `mutation deleteClubAndAdmin($input: DeleteClubAndAdminInput!) {
    deleteClubAndAdmin(input: $input) {
      status
    }
  }`;
const unexpectedErrorGql = `mutation unexpectedError {
    unexpectedError {
      neverGetsReturned
    }
  }`;

export const anUnknownUserAddsAClubViaApiKey = async (
  newAdminEmail: string,
  newClubName: string,
): Promise<{
  clubId: string;
  userId: string;
}> => {
  const variables = {
    input: {
      newAdminEmail,
      newClubName,
      suppressInvitationEmail: true, // only for testing, due to email quota
      recaptchaToken:
        "always honored in test envs; cannot be automatedly-tested in prod",
    },
  };

  const data = await GraphQL(
    requiredEnvVar("API_URL"),
    createClubGql,
    variables,
    null,
    requiredEnvVar("CREATE_CLUB_API_KEY"),
  );
  const output = data.createClub as CreateClubResponse;

  log("anUnknownUserAddsAClubViaApiKey.end", "debug", {
    userId: output.userId,
    clubId: output.clubId,
  });
  return output;
};

// TODO: refactor out the duplication with the next two functions
export const anUnknownUserCallsDeleteClubAndAdmin = async (
  userId: string,
  clubId: string,
): Promise<DeleteClubAndAdminResponse> => {
  const variables = {
    input: {
      userId,
      clubId,
    },
  };

  const data = await GraphQL(
    requiredEnvVar("API_URL"),
    deleteClubAndAdminGql,
    variables,
    null,
    requiredEnvVar("CREATE_CLUB_API_KEY"),
  );
  const output = data.deleteClubAndAdmin as DeleteClubAndAdminResponse;

  log("anUnknownUserCallsDeleteClubAndAdmin", "debug", { output });
  return output;
};

export const anUnknownUserCallsUnexpectedError =
  async (): Promise<UnexpectedErrorResponse> => {
    const data = await GraphQL(
      requiredEnvVar("API_URL"),
      unexpectedErrorGql,
      {},
      null,
      requiredEnvVar("CREATE_CLUB_API_KEY"),
    );
    return data.unexpectedError as UnexpectedErrorResponse;
  };

export const aUserCallsUnexpectedError = async (
  idToken: string,
): Promise<UnexpectedErrorResponse> => {
  const data = await GraphQL(
    requiredEnvVar("API_URL"),
    unexpectedErrorGql,
    {},
    idToken,
  );
  return data.unexpectedError as UnexpectedErrorResponse;
};

export const aUserCallsDeleteClubAndAdmin = async (
  userId: string,
  clubId: string,
  idToken: string,
): Promise<DeleteClubAndAdminResponse> => {
  const variables = { input: { userId, clubId } };

  const data = await GraphQL(
    requiredEnvVar("API_URL"),
    deleteClubAndAdminGql,
    variables,
    idToken,
  );
  const output = data.deleteClubAndAdmin as DeleteClubAndAdminResponse;

  log("aUserCallsDeleteClubAndAdmin", "debug", { output });
  return output;
};

export const aUserCallsCreateClub = async (
  newAdminEmail: string,
  newClubName: string,
  idToken: string,
): Promise<CreateClubResponse> => {
  const variables = {
    input: {
      newAdminEmail,
      newClubName,
      recaptchaToken: "ignored in test envs",
      suppressInvitationEmail: true, // only for testing, due to email quota
    },
  };

  const data = await GraphQL(
    requiredEnvVar("API_URL"),
    createClubGql,
    variables,
    idToken,
  );
  const output = data.createClub as CreateClubResponse;

  log("aUserCallsCreateClub", "debug", { output });
  return output;
};

export const aUserCallsGetMyProfile = async (user: {
  idToken: string;
  username: string;
}) => {
  const getMyProfile = `query getMyProfile {
    getMyProfile {
      backgroundImageUrl
      bio
      birthdate
      createdAt
      followersCount
      followingCount
      id
      imageUrl
      likesCounts
      location
      name
      screenName
      tweetsCount
      website
    }
  }`;

  if (!process.env.API_URL) {
    throw new Error("No API_URL was specified!");
  }
  const data = await GraphQL(
    process.env.API_URL,
    getMyProfile,
    {},
    user.idToken,
  );
  const profile = data.getMyProfile;

  log("aUserCallsGetMyProfile.end", "debug", { user });

  return profile;
};

export const aUserCallsEditMyProfile = async (
  user: { username: string; idToken: string },
  input,
) => {
  const editMyProfile = `mutation editMyProfile($input: ProfileInput!) {
    editMyProfile(newProfile: $input) {
      backgroundImageUrl
      bio
      birthdate
      createdAt
      followersCount
      followingCount
      id
      imageUrl
      likesCounts
      location
      name
      screenName
      tweetsCount
      website
    }
  }`;
  const variables = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    input,
  };

  if (!process.env.API_URL) {
    throw new Error("No API_URL was specified!");
  }
  const data = await GraphQL(
    process.env.API_URL,
    editMyProfile,
    variables,
    user.idToken,
  );
  const profile = data.editMyProfile;

  log("aUserCallsEditMyProfile.end", "debug", { user });

  return profile;
};
