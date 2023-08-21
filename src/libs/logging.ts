import { Configuration, configure, getLogger, isConfigured } from "log4js";

import rootDirName from "../../rootDirName";

const layoutType = process.env["NODE_ENV"] === "test" ? "colored" : "basic";

const configString = process.env["SB_LOGGING_CONFIG"]
  ? process.env["SB_LOGGING_CONFIG"]
  : JSON.stringify(
      {
        appenders: {
          stdout: {
            type: "stdout",
            layout: { type: layoutType },
          },
        },
        categories: {
          default: {
            appenders: ["stdout"],
            level: "debug",
          },
          __test__: {
            appenders: ["stdout"],
            level: "trace",
          },
        },
      },
      null,
      2,
    );
const config = JSON.parse(configString) as Configuration;

if (!isConfigured()) {
  console.log(`Using logging config:\n${configString}`);
  configure(config);
  getLogger().info("Successfully configured log4js");
} else {
  getLogger().warn(`log4js was already configured; skipping configuration`);
}

export function logFn(
  filename: string,
): (catSuffix: string, logLevel: string, ...addlParams: unknown[]) => void {
  console.log("****** rootDirName in cloud", { rootDirName });
  let catPrefix = filename.slice(rootDirName.length);
  if (catPrefix.startsWith("/")) {
    catPrefix = catPrefix.slice(1);
  }
  return (catSuffix: string, logLevel: string, ...addlParams: unknown[]) => {
    getLogger(catPrefix + catSuffix).log(logLevel, ...addlParams);
  };
}
