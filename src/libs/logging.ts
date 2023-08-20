import rootDirName from "../../rootDirName";
import {
  LoggingConfig,
  LogLevel,
  PrintFnParams,
  withConfigProvideLogFn,
} from "./genericLogger";

const configString = process.env["SB_LOGGING_CONFIG"]
  ? process.env["SB_LOGGING_CONFIG"]
  : '{"": "info"}';
const config = JSON.parse(configString) as LoggingConfig;
console.log(`Using logging config:\n${configString}`);

const getCloudPrintFn = (...addlParams: unknown[]) => {
  return ({
    matchingConfigKey,
    matchingConfigLevel,
    requestedLogLevel,
    requestedKey,
  }: PrintFnParams) => {
    const remainingKey = requestedKey.slice(matchingConfigKey.length);
    console.log(
      `${new Date().toJSON()} ${requestedLogLevel.toLocaleUpperCase()} ` +
        `(${matchingConfigKey}@${matchingConfigLevel.toLocaleUpperCase()})` +
        `${remainingKey}`,
      ...addlParams,
    );
  };
};

export function logFn(
  filename: string,
): (keySuffix: string, logLevel: LogLevel, ...addlParams: unknown[]) => void {
  let key = filename.slice(rootDirName.length);
  if (key.startsWith("/")) {
    key = key.slice(1);
  }
  return withConfigProvideLogFn(config, getCloudPrintFn)(key);
}
