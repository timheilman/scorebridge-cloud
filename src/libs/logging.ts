import { Configuration, configure, getLogger, isConfigured } from "log4js";

const configString = process.env["SB_LOGGING_CONFIG"]
  ? process.env["SB_LOGGING_CONFIG"]
  : JSON.stringify(
      {
        appenders: {
          console: {
            type: "console",
            layout: {
              ...(process.env["NODE_ENV"] === "test"
                ? { type: "colored" }
                : { type: "pattern", pattern: "%p %c %m" }), // better for cloudwatch
            },
          },
        },
        categories: {
          default: {
            appenders: ["console"],
            level: "debug",
          },
          __test__: {
            appenders: ["console"],
            level: "trace",
          },
        },
      },
      null,
      2,
    );
const config = JSON.parse(configString) as Configuration;

const metaLogCatPrefix = "src.libs.logging.";

export function logFn(
  catPrefix: string,
  metaLogLevel = "trace",
): (catSuffix: string, logLevel: string, ...addlParams: unknown[]) => void {
  if (!isConfigured()) {
    if (metaLogLevel !== "trace") {
      // emit only at debug and above before init
      console.log(`Using logging config:\n${configString}`);
    }
    configure(config);
    getLogger(metaLogCatPrefix + "logFn.configure.success").log(metaLogLevel);
  } else {
    getLogger(metaLogCatPrefix + "logFn.preconfigured").log(metaLogLevel);
  }
  return (catSuffix: string, logLevel: string, ...addlParams: unknown[]) => {
    getLogger(catPrefix + catSuffix).log(logLevel, ...addlParams);
  };
}
