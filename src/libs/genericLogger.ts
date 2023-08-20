// We want to be able to log from anyfile like this:
// log("DEBUG", "message")

// but to help locate which file is doing the logging, we want per-file:
// const log = logFn(__filename)
// to then use in the above message

// But we want to configure only once:
// 1) the config
// 2) how to format the resulting message
// 3) where to send it (like console.log or a file)

// so at the per-repo-level, bare bones example:
// const config = JSON.parse(
//   readRelativeUtf8FileSync("config.json"),
// ) as LoggingConfig;
// const getPrintFn = (message) => {
//   return ({ requestedKey, requestedLogLevel }: PrintFnParams) => {
//     console.log(
//       `${new Date().toJSON()} ${requestedKey} ${requestedLogLevel} ${message}`,
//     );
//   };
// };
// export const logFn = withConfigProvideLogFn(config, getPrintFn);
// in order to provide the const log = logFn(), call above

const levelToInt = {
  trace: 100,
  debug: 200,
  info: 300,
  warn: 400,
  error: 500,
  fatal: 600,
  extinction: 700,
};
export type LogLevel = keyof typeof levelToInt;
export type LoggingConfig = {
  [keyPrefix: string]: LogLevel;
};

export interface PrintFnParams {
  matchingConfigKey: string;
  matchingConfigLevel: LogLevel;
  requestedLogLevel: LogLevel;
  requestedKey: string;
}

export function genericLogger(loggingConfig: LoggingConfig) {
  return (
    key: string,
    logLevel: LogLevel,
    printFn: (p: PrintFnParams) => void,
  ) => {
    const matchingConfigKey = Object.keys(loggingConfig).reduce<string>(
      (acc, configKey) => {
        if (key.startsWith(configKey)) {
          if (acc.length <= configKey.length) {
            return configKey;
          }
        }
        return acc;
      },
      "",
    );
    const matchingConfigLevel =
      matchingConfigKey === ""
        ? "extinction"
        : loggingConfig[matchingConfigKey];
    if (levelToInt[logLevel] >= levelToInt[matchingConfigLevel]) {
      printFn({
        matchingConfigKey,
        matchingConfigLevel,
        requestedLogLevel: logLevel,
        requestedKey: key,
      });
    }
  };
}

export function withConfigProvideLogFn(
  config: LoggingConfig,
  printFnProvider: (
    message: string,
    ...addlParams: unknown[]
  ) => (PrintFnParams) => void,
) {
  return (key: string) => {
    return (logLevel: LogLevel, message: string, ...addlParams: unknown[]) => {
      genericLogger(config)(
        key,
        logLevel,
        printFnProvider(message, addlParams),
      );
    };
  };
}
