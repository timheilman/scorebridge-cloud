import { AppSyncResolverEvent } from "aws-lambda";
import { AppSyncResolverHandler } from "aws-lambda/trigger/appsync-resolver";
import {
  ExampleLambdaDataSourceOutput,
  QueryExampleLambdaDataSourceArgs,
} from "../../../appsync";

// eslint-disable-next-line import/prefer-default-export
export const main: AppSyncResolverHandler<
  QueryExampleLambdaDataSourceArgs,
  ExampleLambdaDataSourceOutput
> = async (
  event: AppSyncResolverEvent<QueryExampleLambdaDataSourceArgs>,
): Promise<ExampleLambdaDataSourceOutput> => {
  const ct = event.arguments.input.contentType;
  const ext = event.arguments.input.extension;
  console.log(
    `Hello World!  I found strongly-typed content-type ${ct} and extension ${ext}`,
  );
  console.log(JSON.stringify(event, null, 2));
  return { exampleOutputField: JSON.stringify(event, null, 2) };
};
