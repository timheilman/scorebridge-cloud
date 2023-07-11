import { AppSyncResolverEvent } from "aws-lambda";
import { AppSyncResolverHandler } from "aws-lambda/trigger/appsync-resolver";
import { QueryExampleLambdaDataSourceArgs } from "../../../appsync";

// eslint-disable-next-line import/prefer-default-export
export const main: AppSyncResolverHandler<
  QueryExampleLambdaDataSourceArgs,
  string
> = async (event: AppSyncResolverEvent<QueryExampleLambdaDataSourceArgs>) => {
  const ct = event.arguments.input.contentType;
  const ext = event.arguments.input.extension;
  console.log(
    `Hello World!  I found strongly-typed content-type ${ct} and extension ${ext}`
  );
  console.log(JSON.stringify(event, null, 2));
  return JSON.stringify(event, null, 2);
};
