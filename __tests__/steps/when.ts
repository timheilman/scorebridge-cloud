import { config as dotenvConfig } from "dotenv";
import {
  AppSyncResolverEvent,
  PostConfirmationTriggerEvent,
  Context as AwsLambdaContext,
} from "aws-lambda";
import {
  AdminConfirmSignUpCommand,
  CognitoIdentityProviderClient,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { main as confirmUserSignup } from "../../src/functions/confirm-user-signup/handler";
import { main as exampleLambdaDataSource } from "../../src/functions/example-lambda-data-source/handler";
import fromSsoUsingProfileFromEnv from "../../src/libs/from-sso-using-profile-from-env";
import GraphQL from "../lib/graphql";
import { QueryExampleLambdaDataSourceArgs } from "../../appsync";

dotenvConfig();

const weInvokeConfirmUserSignup = async (
  username: string,
  name: string,
  email: string
) => {
  // const context = {};
  const event: PostConfirmationTriggerEvent = {
    callerContext: {
      awsSdkVersion: "mockedAwsSdkVersion",
      clientId: "mockedClientId",
    },
    version: "mockedVersion",
    region: process.env.AWS_REGION,
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    userName: username,
    triggerSource: "PostConfirmation_ConfirmSignUp",
    request: {
      userAttributes: {
        sub: username,
        "cognito:email_alias": email,
        "cognito:user_status": "CONFIRMED",
        email_verified: "false",
        name,
        email,
      },
    },
    response: {},
  };

  await confirmUserSignup(event /* , context */);
};

const weInvokeExampleLambdaDataSource = async (
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

const aUserSignsUp = async (password: string, name: string, email: string) => {
  const cognito = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION,
    credentials: fromSsoUsingProfileFromEnv(),
  });

  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  const clientId = process.env.WEB_COGNITO_USER_POOL_CLIENT_ID;

  const signUpResp = await cognito.send(
    new SignUpCommand({
      ClientId: clientId,
      Username: email,
      Password: password,
      UserAttributes: [{ Name: "name", Value: name }],
    })
  );

  const username = signUpResp.UserSub;
  console.log(`[${email}] - user has signed up [${username}]`);

  await cognito.send(
    new AdminConfirmSignUpCommand({
      UserPoolId: userPoolId,
      Username: username,
    })
  );

  console.log(`[${email}] - confirmed sign up`);

  return {
    username,
    name,
    email,
  };
};

const aUserCallsGetMyProfile = async (user) => {
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

const aUserCallsEditMyProfile = async (user, input) => {
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
export {
  weInvokeConfirmUserSignup,
  weInvokeExampleLambdaDataSource,
  aUserSignsUp,
  aUserCallsGetMyProfile,
  aUserCallsEditMyProfile,
};
