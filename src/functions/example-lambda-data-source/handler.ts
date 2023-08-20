import { AppSyncResolverEvent } from "aws-lambda";
import { AppSyncResolverHandler } from "aws-lambda/trigger/appsync-resolver";

import { logFn } from "../../libs/logging";
const log = logFn(__filename);
import {
  ExampleLambdaDataSourceOutput,
  QueryExampleLambdaDataSourceArgs,
} from "../../../appsync";
export const main: AppSyncResolverHandler<
  QueryExampleLambdaDataSourceArgs,
  ExampleLambdaDataSourceOutput
> = async (
  event: AppSyncResolverEvent<QueryExampleLambdaDataSourceArgs>,
  // eslint-disable-next-line @typescript-eslint/require-await
): Promise<ExampleLambdaDataSourceOutput> => {
  const ct = event.arguments.input.contentType;
  const ext = event.arguments.input.extension;
  log(
    "debug",
    `Hello World!  I found strongly-typed content-type ${ct} and extension ${ext}`,
  );
  log("debug", JSON.stringify(event, null, 2));
  return { exampleOutputField: JSON.stringify(event, null, 2) };
};
