import rootDirName from "../../rootDirName";
import {
  LoggingConfig,
  LogLevel,
  PrintFnParams,
  withConfigProvideLogFn,
} from "./genericLogger";
import readRelativeUtf8FileSync from "./readRelativeUtf8FileSync";

const config = JSON.parse(
  readRelativeUtf8FileSync(__dirname, "loggingConfig.json"),
) as LoggingConfig;

const getCloudPrintFn = (message: string, ...addlParams: unknown[]) => {
  return ({
    matchingConfigLine,
    requestedLogLevel,
    requestedKey,
  }: PrintFnParams) => {
    const remainingKey = requestedKey.slice(
      matchingConfigLine.keyPrefix.length,
    );
    console.log(
      `${new Date().toJSON()} ${requestedLogLevel.toLocaleUpperCase()} (${
        matchingConfigLine.keyPrefix
      }@${matchingConfigLine.logLevel.toLocaleUpperCase()})${remainingKey} ${message}`,
      ...addlParams,
    );
  };
};
console.log(`Found filesystem logging config:\n${JSON.stringify(config)}`);
export function logFn(
  filename: string,
): (logLevel: LogLevel, message: string, ...addlParams: unknown[]) => void {
  let key = filename.slice(rootDirName.length);
  if (key.startsWith("/")) {
    key = key.slice(1);
  }
  return withConfigProvideLogFn(config, getCloudPrintFn)(key);
}
