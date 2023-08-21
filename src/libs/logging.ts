import { Configuration, configure, getLogger, isConfigured } from "log4js";

import rootDirName from "../../rootDirName";

const layoutType = process.env["NODE_ENV"] === "test" ? "colored" : "basic";

const configString = process.env["SB_LOGGING_CONFIG"]
  ? process.env["SB_LOGGING_CONFIG"]
  : `{
  "appenders": {
    "stdout": {
      "type": "stdout",
      "layout": { "type": "${layoutType}" }
    },
  },
  "categories": {
    "default": {
      "appenders": ["stdout"],
      "level": "debug"
    },
    "__test__": {
      "appenders": ["stdout"],
      "level": "trace"
    }
  }
}`;
const config = JSON.parse(configString) as Configuration;

if (!isConfigured()) {
  console.log(`Using logging config:\n${configString}`);
  configure(config);
  getLogger().info("Successfully configured log4js");
} else {
  getLogger().warn(`log4js was already configured; skipping configuration`);
}

// want to leave files alone, so they can say:
// import { logFn } from "logging";
// const log = logFn(__filename);
// log(".main", "debug", { stuff: "here" })

// translates to:
// log4js.getLogger(filename + ".main").debug("", { stuff: "here" })
// or maybe the empty-string is not necessary

export function logFn(
  filename: string,
): (catSuffix: string, logLevel: string, ...addlParams: unknown[]) => void {
  let catPrefix = filename.slice(rootDirName.length);
  if (catPrefix.startsWith("/")) {
    catPrefix = catPrefix.slice(1);
  }
  return (catSuffix: string, logLevel: string, ...addlParams: unknown[]) => {
    getLogger(catPrefix + catSuffix).log(logLevel, ...addlParams);
  };
}
