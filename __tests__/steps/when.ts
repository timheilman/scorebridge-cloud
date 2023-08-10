import { AppSyncResolverEvent, Context as AwsLambdaContext } from "aws-lambda";
import { config as dotenvConfig } from "dotenv";

import {
  AddClubResponse,
  ExampleLambdaDataSourceOutput,
  QueryExampleLambdaDataSourceArgs,
  RemoveClubAndAdminResponse,
} from "../../appsync";
import { main as exampleLambdaDataSource } from "../../src/functions/example-lambda-data-source/handler";
import requiredEnvVar from "../../src/libs/requiredEnvVar";
import GraphQL from "../lib/graphql";

dotenvConfig();

export const weInvokeExampleLambdaDataSource = async (
  extension: string,
  contentType: string,
): Promise<void | ExampleLambdaDataSourceOutput> => {
  const minimalEvent: AppSyncResolverEvent<QueryExampleLambdaDataSourceArgs> = {
    arguments: {
      input: {
        extension,
        contentType,
      },
    },
    source: undefined,
    request: {
      headers: undefined,
      domainName: "",
    },
    info: {
      selectionSetList: [],
      selectionSetGraphQL: "",
      parentTypeName: "",
      fieldName: "",
      variables: {},
    },
    prev: {
      result: {},
    },
    stash: {},
  };
  const minimalContext: AwsLambdaContext = {
    callbackWaitsForEmptyEventLoop: false,
    functionName: "",
    functionVersion: "",
    invokedFunctionArn: "",
    memoryLimitInMB: "",
    awsRequestId: "",
    logGroupName: "",
    logStreamName: "",
    getRemainingTimeInMillis(): number {
      throw new Error("Function not implemented.");
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    done(_error?: Error, _result?: unknown): void {
      throw new Error("Function not implemented.");
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    fail(_error: string | Error): void {
      throw new Error("Function not implemented.");
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    succeed(_messageOrObject: unknown): void {
      throw new Error("Function not implemented.");
    },
  };
  return exampleLambdaDataSource(minimalEvent, minimalContext, null);
};

export const anUnknownUserAddsAClubViaApiKey = async (
  newAdminEmail: string,
  newClubName: string,
): Promise<{
  clubId: string;
  userId: string;
}> => {
  const addClub = `mutation addClub($input: AddClubInput!) {
    addClub(input: $input) {
      newClubId
      newUserId
    }
  }`;
  const variables = {
    input: {
      newAdminEmail,
      newClubName,
      suppressInvitationEmail: true, // only for testing, due to email quota
    },
  };

  const data = await GraphQL(
    requiredEnvVar("API_URL"),
    addClub,
    variables,
    null,
    requiredEnvVar("ADD_CLUB_API_KEY"), // TODO: SCOR-66 use secrets manager instead
  );
  const output = data.addClub as AddClubResponse;

  console.log(
    `added club. newUserId: ${output.userId}; newClubId: ${output.clubId}`,
  );
  return output;
};

export const aUserCallsRemoveClubAndAdmin = async (
  userId: string,
  clubId: string,
  accessToken: string,
): Promise<RemoveClubAndAdminResponse> => {
  const removeClubAndAdmin = `mutation removeClubAndAdmin($input: RemoveClubAndAdminInput!) {
    removeClubAndAdmin(input: $input) {
      status
    }
  }`;
  const variables = {
    input: {
      userId,
      clubId,
    },
  };

  const data = await GraphQL(
    requiredEnvVar("API_URL"),
    removeClubAndAdmin,
    variables,
    accessToken,
  );
  const output = data.removeClubAndAdmin as RemoveClubAndAdminResponse;

  console.log(`removed club and admin. status: ${output.status}`);
  return output;
};

export const aUserCallsGetMyProfile = async (user: {
  accessToken: string;
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
    user.accessToken,
  );
  const profile = data.getMyProfile;

  console.log(`[${user.username}] - fetched profile`);

  return profile;
};

export const aUserCallsEditMyProfile = async (
  user: { username: string; accessToken: string },
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
    user.accessToken,
  );
  const profile = data.editMyProfile;

  console.log(`[${user.username}] - fetched profile`);

  return profile;
};
