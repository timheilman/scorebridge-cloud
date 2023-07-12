import { AppSyncResolverEvent } from "aws-lambda";
import { AppSyncResolverHandler } from "aws-lambda/trigger/appsync-resolver";
import { ulid } from "ulid";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import fromSsoUsingProfileFromEnv from "@libs/from-sso-using-profile-from-env";
import { fromEnv } from "@aws-sdk/credential-providers";
import {
  AdminCreateUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminUpdateUserAttributesCommandInput,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import requiredEnvVar from "@libs/requiredEnvVar";
import { AddClubResponse, MutationAddClubArgs } from "../../../appsync";

// export const main: AppSyncResolverHandler<
//   QueryExampleLambdaDataSourceArgs,
//   ExampleLambdaDataSourceOutput
// > = async (
//   event: AppSyncResolverEvent<QueryExampleLambdaDataSourceArgs>
// ): Promise<ExampleLambdaDataSourceOutput> => {
//   const ct = event.arguments.input.contentType;
//   const ext = event.arguments.input.extension;
//   console.log(
//     `Hello World!  I found strongly-typed content-type ${ct} and extension ${ext}`
//   );
//   console.log(JSON.stringify(event, null, 2));
//   return { exampleOutputField: JSON.stringify(event, null, 2) };
// };

let cognitoIdpClient;

function cachedCognitoIdpClient() {
  if (cognitoIdpClient) {
    return cognitoIdpClient;
  }
  cognitoIdpClient = new CognitoIdentityProviderClient({
    region: requiredEnvVar("AWS_REGION"),
    credentials: fromEnv(),
  });
  return cognitoIdpClient;
}

async function createUser(email: string) {
  try {
    const createUserParams = {
      UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
      Username: email,
      UserAttributes: [{ Name: "email", Value: email }],
    };

    const createUserCommand = new AdminCreateUserCommand(createUserParams);
    return await cachedCognitoIdpClient().send(createUserCommand);
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// eslint-disable-next-line import/prefer-default-export
export const main: AppSyncResolverHandler<
  MutationAddClubArgs,
  AddClubResponse
> = async (
  event: AppSyncResolverEvent<MutationAddClubArgs>
): Promise<AddClubResponse> => {
  const email = event.arguments.input.newAdminEmail;
  // const clubName = event.arguments.input.newClubName;
  const clubId = ulid();
  // cognito: create the user; this should send email
  const createdUser = await createUser(email);
  console.log("createdUser", createdUser);
  console.log("createdUser.User?.Username", createdUser?.User?.Username);
  // cognito: set user's role to adminClub
  // cognito: set user's clubId to synthetic id for the club
  try {
    const updateUserParams: AdminUpdateUserAttributesCommandInput = {
      UserAttributes: [
        { Name: "custom:role", Value: "adminClub" },
        { Name: "custom:tenantId", Value: clubId },
      ],
      UserPoolId: requiredEnvVar("COGNITO_USER_POOL_ID"),
      Username: email,
    };
    const updateUserCommand = new AdminUpdateUserAttributesCommand(
      updateUserParams
    );
    await cachedCognitoIdpClient().send(updateUserCommand);
  } catch (error) {
    console.error("Error updating user to adminClub role:", error);
    throw error;
  }
  console.log("Cognito user with role adminClub created successfully.");

  // snippet to putItem, but!  first, let's create the user in cognito
  // and see if we can't use its id as ours since that's what Yan did:
  //
  // const newClubId = ulid();
  // const newUserId = ulid();
  //
  // const user = {
  //   id: { S: event.userName },
  //   name: { S: name },
  //   screenName: { S: screenName },
  //   createdAt: { S: new Date().toJSON() },
  // };
  // const client = new DynamoDBClient({
  //   region: process.env.AWS_REGION || "NO_REGION_FOUND_IN_ENV",
  //   credentials:
  //       process.env.NODE_ENV === "test"
  //           ? fromSsoUsingProfileFromEnv()
  //           : fromEnv(),
  // });
  // const command = new PutItemCommand({
  //   TableName: USERS_TABLE,
  //   Item: user,
  //   ConditionExpression: "attribute_not_exists(id)",
  // });
  // await client.send(command);
  //
  // return event;

  // create the club record w/provided description
  // ddb: create the user
  const {
    USERS_TABLE,
    CLUBS_TABLE,
    COGNITO_USER_POOL_ID,
    SELF_SIGN_UP_COGNITO_USER_POOL_CLIENT_ID,
  } = process.env;

  [
    USERS_TABLE,
    CLUBS_TABLE,
    COGNITO_USER_POOL_ID,
    SELF_SIGN_UP_COGNITO_USER_POOL_CLIENT_ID,
  ].forEach((val) => console.log(val));
  console.log("and the event:");
  console.log(JSON.stringify(event, null, 2));
  return {
    newClubId: "FAKE_NEW_CLUB_ID",
  };
  // if (event.triggerSource !== "PostConfirmation_ConfirmSignUp") {
  //   return event;
  // }
  // const { name } = event.request.userAttributes;
  // const suffix = chance.string({
  //   length: 8,
  //   casing: "upper",
  //   alpha: true,
  //   numeric: true,
  // });
  // const screenName = `${name.replace(/[^a-zA-Z0-9]/g, "")}${suffix}`;
  // const user = {
  //   id: { S: event.userName },
  //   name: { S: name },
  //   screenName: { S: screenName },
  //   createdAt: { S: new Date().toJSON() },
  // };
  // const client = new DynamoDBClient({
  //   region: process.env.AWS_REGION || "NO_REGION_FOUND_IN_ENV",
  //   credentials:
  //     process.env.NODE_ENV === "test"
  //       ? fromSsoUsingProfileFromEnv()
  //       : fromEnv(),
  // });
  // const command = new PutItemCommand({
  //   TableName: USERS_TABLE,
  //   Item: user,
  //   ConditionExpression: "attribute_not_exists(id)",
  // });
  // await client.send(command);
  //
  // return event;
};
