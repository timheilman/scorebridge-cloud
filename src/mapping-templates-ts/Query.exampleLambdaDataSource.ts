import {
  ExampleLambdaDataSourceOutput,
  QueryExampleLambdaDataSourceArgs,
} from "../../appsync";
import {
  lambdaErrorHandlingResponse,
  lambdaPassThroughInvoke,
} from "./mappingTemplateUtils";

export const request =
  lambdaPassThroughInvoke<QueryExampleLambdaDataSourceArgs>;

export const response = lambdaErrorHandlingResponse<
  QueryExampleLambdaDataSourceArgs,
  ExampleLambdaDataSourceOutput
>;
