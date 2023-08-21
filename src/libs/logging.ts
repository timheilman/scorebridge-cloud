import log4js, { Configuration } from "log4js";

import rootDirName from "../../rootDirName";

const configString = process.env["SB_LOGGING_CONFIG"]
  ? process.env["SB_LOGGING_CONFIG"]
  : `{
  "appenders": {
    "out": {
      "type": "stdout",
      "layout": { "type": "colored" }
    },
    "err": {
      "type": "stderr",
      "layout": { "type": "basic" }
    }
  },
  "categories": {
    "default": {
      "appenders": ["out"],
      "level": "debug"
    },
    "__test__": {
      "appenders": ["out"],
      "level": "debug"
    }
  }
}`;
const config = JSON.parse(configString) as Configuration;

if (!log4js.isConfigured()) {
  console.log(`Using logging config:\n${configString}`);
  log4js.configure(config);
  log4js.getLogger().info("Successfully configured log4js");
} else {
  log4js
    .getLogger()
    .warn(`log4js was already configured; skipping configuration`);
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
    log4js.getLogger(catPrefix + catSuffix).log(logLevel, ...addlParams);
  };
}
