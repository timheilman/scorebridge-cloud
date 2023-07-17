import { config as dotenvConfig } from "dotenv";
import { weInvokeExampleLambdaDataSource } from "../../steps/when";
import { ExampleLambdaDataSourceOutput } from "../../../appsync";

dotenvConfig();
describe("When exampleLambdaDataSource runs", () => {
  it.each([
    [".png", "image/png"],
    [".jpeg", "image/jpeg"],
    [".png", null],
    [null, "image/png"],
    [null, null],
  ])(
    "Returns an arg list for extension %s and content type %s",
    async (extension, contentType) => {
      const result: ExampleLambdaDataSourceOutput =
        (await weInvokeExampleLambdaDataSource(
          extension,
          contentType,
        )) as ExampleLambdaDataSourceOutput;
      expect(
        JSON.parse(result.exampleOutputField).arguments.input.extension,
      ).toBe(extension);
      expect(
        JSON.parse(result.exampleOutputField).arguments.input.contentType,
      ).toBe(contentType);
    },
  );
});
