import { config as dotenvConfig } from "dotenv";

import { AddClubResponse, RemoveClubAndAdminResponse } from "../../appsync";
import { logFn } from "../../src/libs/logging";
import requiredEnvVar from "../../src/libs/requiredEnvVar";
import GraphQL from "../lib/graphql";
const log = logFn("__tests__.steps.when.");
dotenvConfig();

const addClubGql = `mutation addClub($input: AddClubInput!) {
    addClub(input: $input) {
      clubId
      userId
    }
  }`;
const removeClubAndAdminGql = `mutation removeClubAndAdmin($input: RemoveClubAndAdminInput!) {
    removeClubAndAdmin(input: $input) {
      status
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
    },
  };

  const data = await GraphQL(
    requiredEnvVar("API_URL"),
    addClubGql,
    variables,
    null,
    requiredEnvVar("ADD_CLUB_API_KEY"),
  );
  const output = data.addClub as AddClubResponse;

  log("anUnknownUserAddsAClubViaApiKey.end", "debug", {
    userId: output.userId,
    clubId: output.clubId,
  });
  return output;
};

// TODO: refactor out the duplication with the next two functions
export const anUnknownUserCallsRemoveClubAndAdmin = async (
  userId: string,
  clubId: string,
): Promise<RemoveClubAndAdminResponse> => {
  const variables = {
    input: {
      userId,
      clubId,
    },
  };

  const data = await GraphQL(
    requiredEnvVar("API_URL"),
    removeClubAndAdminGql,
    variables,
    null,
    requiredEnvVar("ADD_CLUB_API_KEY"),
  );
  const output = data.removeClubAndAdmin as RemoveClubAndAdminResponse;

  log("anUnknownUserCallsRemoveClubAndAdmin", "debug", { output });
  return output;
};

export const aUserCallsRemoveClubAndAdmin = async (
  userId: string,
  clubId: string,
  idToken: string,
): Promise<RemoveClubAndAdminResponse> => {
  const variables = { input: { userId, clubId } };

  const data = await GraphQL(
    requiredEnvVar("API_URL"),
    removeClubAndAdminGql,
    variables,
    idToken,
  );
  const output = data.removeClubAndAdmin as RemoveClubAndAdminResponse;

  log("aUserCallsRemoveClubAndAdmin", "debug", { output });
  return output;
};

export const aUserCallsAddClub = async (
  newAdminEmail: string,
  newClubName: string,
  idToken: string,
): Promise<AddClubResponse> => {
  const variables = {
    input: {
      newAdminEmail,
      newClubName,
      suppressInvitationEmail: true, // only for testing, due to email quota
    },
  };

  const data = await GraphQL(
    requiredEnvVar("API_URL"),
    addClubGql,
    variables,
    idToken,
  );
  const output = data.addClub as AddClubResponse;

  log("aUserCallsAddClub", "debug", { output });
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
