import { config as dotenvConfig } from "dotenv";

import {
  CreateClubResponse,
  DeleteClubAndAdminResponse,
  UnexpectedErrorResponse,
} from "../../scorebridge-ts-submodule/graphql/appsync";
import { logFn } from "../../src/libs/logging";
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

  const data = await GraphQL(createClubGql, variables);
  const output = data.createClub as CreateClubResponse;

  log("anUnknownUserAddsAClubViaApiKey.end", "debug", {
    userId: output.userId,
    clubId: output.clubId,
  });
  return output;
};

export const anUnknownUserCallsDeleteClubAndAdmin = async (
  userId: string,
  clubId: string,
): Promise<DeleteClubAndAdminResponse> => {
  const data = await GraphQL(deleteClubAndAdminGql, {
    input: {
      userId,
      clubId,
    },
  });
  const output = data.deleteClubAndAdmin as DeleteClubAndAdminResponse;

  log("anUnknownUserCallsDeleteClubAndAdmin", "debug", { output });
  return output;
};

export const anUnknownUserCallsUnexpectedError =
  async (): Promise<UnexpectedErrorResponse> => {
    const data = await GraphQL(unexpectedErrorGql, {});
    return data.unexpectedError as UnexpectedErrorResponse;
  };

export const aUserCallsUnexpectedError = async (
  idToken: string,
): Promise<UnexpectedErrorResponse> => {
  const data = await GraphQL(unexpectedErrorGql, {}, idToken);
  return data.unexpectedError as UnexpectedErrorResponse;
};

export const aUserCallsDeleteClubAndAdmin = async (
  userId: string,
  clubId: string,
  idToken: string,
): Promise<DeleteClubAndAdminResponse> => {
  const variables = { input: { userId, clubId } };

  const data = await GraphQL(deleteClubAndAdminGql, variables, idToken);
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

  const data = await GraphQL(createClubGql, variables, idToken);
  const output = data.createClub as CreateClubResponse;

  log("aUserCallsCreateClub", "debug", { output });
  return output;
};
