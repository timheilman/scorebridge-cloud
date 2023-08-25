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

const catPrefix = "src.libs.logging.";
if (!isConfigured()) {
  configure(config);
  logFn(catPrefix)("notIsConfigured.configure.success", "info");
} else {
  logFn(catPrefix)("isConfigured.skipWarning", "warn", {
    message: `log4js was already configured; skipping configuration`,
  });
}

export function logFn(
  catPrefix: string,
): (catSuffix: string, logLevel: string, ...addlParams: unknown[]) => void {
  return (catSuffix: string, logLevel: string, ...addlParams: unknown[]) => {
    getLogger(catPrefix + catSuffix).log(logLevel, ...addlParams);
  };
}
