import { config as dotenvConfig } from "dotenv";

import { ExampleLambdaDataSourceOutput } from "../../../appsync";
import { weInvokeExampleLambdaDataSource } from "../../steps/when";

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
        await weInvokeExampleLambdaDataSource(extension, contentType);
      expect(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        JSON.parse(result.exampleOutputField).arguments.input.extension,
      ).toBe(extension);
      expect(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        JSON.parse(result.exampleOutputField).arguments.input.contentType,
      ).toBe(contentType);
    },
  );
});
