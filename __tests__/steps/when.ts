import { config as dotenvConfig } from "dotenv";
import { AppSyncResolverEvent, Context as AwsLambdaContext } from "aws-lambda";
import requiredEnvVar from "../../src/libs/requiredEnvVar";
import { main as exampleLambdaDataSource } from "../../src/functions/example-lambda-data-source/handler";
import GraphQL from "../lib/graphql";
import { QueryExampleLambdaDataSourceArgs } from "../../appsync";

dotenvConfig();

export const weInvokeExampleLambdaDataSource = async (
  extension: string,
  contentType: string
) => {
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
    // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
    done(_error?: Error, _result?: any): void {
      throw new Error("Function not implemented.");
    },
    // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
    fail(_error: string | Error): void {
      throw new Error("Function not implemented.");
    },
    // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
    succeed(_messageOrObject: any): void {
      throw new Error("Function not implemented.");
    },
  };
  return exampleLambdaDataSource(minimalEvent, minimalContext, null);
};

export async function anUnknownUserAddsAClubViaApiKey(
  newAdminEmail: string,
  newClubName: string
): Promise<{
  newClubId: string;
  newUserId: string;
}> {
  const addClub = `mutation addClub($input: AddClubInput!) {
    addClub(addClubInput: $input) {
      id
      name
    }
  }`;
  const variables = {
    input: {
      newAdminEmail,
      newClubName,
    },
  };

  const data = await GraphQL(
    requiredEnvVar("API_URL"),
    addClub,
    variables,
    null,
    requiredEnvVar("ADD_CLUB_API_KEY")
  );
  const output = data.addClub;

  console.log(
    `added club. newUserId: ${output.newUserId}; newClubId: ${output.newClubId}`
  );
  return output;
}

export const aUserCallsGetMyProfile = async (user) => {
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
    user.accessToken
  );
  const profile = data.getMyProfile;

  console.log(`[${user.username}] - fetched profile`);

  return profile;
};

export const aUserCallsEditMyProfile = async (user, input) => {
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
    input,
  };

  if (!process.env.API_URL) {
    throw new Error("No API_URL was specified!");
  }
  const data = await GraphQL(
    process.env.API_URL,
    editMyProfile,
    variables,
    user.accessToken
  );
  const profile = data.editMyProfile;

  console.log(`[${user.username}] - fetched profile`);

  return profile;
};
