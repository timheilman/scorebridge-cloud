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
};
export type LogLevel = keyof typeof levelToInt;
type LoggingConfigLine = {
  keyPrefix: string;
  logLevel: LogLevel;
};
export type LoggingConfig = LoggingConfigLine[];

export interface PrintFnParams {
  matchingConfigLine: LoggingConfigLine;
  requestedLogLevel: LogLevel;
  requestedKey: string;
}

export function genericLogger(loggingConfig: LoggingConfig) {
  return (
    key: string,
    logLevel: LogLevel,
    printFn: (p: PrintFnParams) => void,
  ) => {
    const matchingConfigLine = loggingConfig.reduce<LoggingConfigLine>(
      (acc, configLine) => {
        if (key.startsWith(configLine.keyPrefix)) {
          if (acc.keyPrefix.length <= configLine.keyPrefix.length) {
            return configLine;
          }
        }
        return acc;
      },
      { keyPrefix: "", logLevel: "fatal" },
    );
    if (levelToInt[logLevel] >= levelToInt[matchingConfigLine.logLevel]) {
      printFn({
        matchingConfigLine,
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
