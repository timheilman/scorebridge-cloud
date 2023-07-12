import { AppSyncResolverEvent } from "aws-lambda";
import { AppSyncResolverHandler } from "aws-lambda/trigger/appsync-resolver";
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

// eslint-disable-next-line import/prefer-default-export
export const main: AppSyncResolverHandler<
  MutationAddClubArgs,
  AddClubResponse
> = async (
  event: AppSyncResolverEvent<MutationAddClubArgs>
): Promise<AddClubResponse> => {
  // generate the synthetic id for the club
  // create the club record w/provided description
  // ddb: create the user
  // cognito: create the user; this should send email
  // cognito: set user's role to adminClub
  // cognito: set user's clubId to synthetic id for the club
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
