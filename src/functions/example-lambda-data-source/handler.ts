import { AppSyncResolverEvent } from "aws-lambda";
import { AppSyncResolverHandler } from "aws-lambda/trigger/appsync-resolver";

import { logFn } from "../../libs/logging";
const log = logFn("src.functions.example-lambda-data-source.handler.");
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
  log("main", "debug", { ct, ext, event });
  return { exampleOutputField: JSON.stringify(event, null, 2) };
};
