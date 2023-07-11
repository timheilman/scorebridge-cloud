import { config as dotenvConfig } from "dotenv";
import { weInvokeExampleLambdaDatasource } from "../../steps/when";
/* eslint-disable no-undef */
dotenvConfig();
describe("When exampleLambdaDatasource runs", () => {
  it.each([
    [".png", "image/png"],
    [".jpeg", "image/jpeg"],
    [".png", null],
    [null, "image/png"],
    [null, null],
  ])(
    "Returns an arg list for extension %s and content type %s",
    async (extension, contentType) => {
      const result = await weInvokeExampleLambdaDatasource(
        extension,
        contentType
      );

      expect(result).toMatch(/^Hello World!/);
      expect(result).toMatch(/region: us-west-2/);
      expect(JSON.parse(result.split("args: ")[1]).extension).toBe(extension);
      expect(JSON.parse(result.split("args: ")[1]).contentType).toBe(
        contentType
      );
    }
  );
});
