import { LogLevel } from "@libs/genericLogger";

import { logFn } from "./logging";

export function getLogCompletionDecorator<T>(
  filename: string,
  logLevel: LogLevel,
) {
  return (promise: Promise<T>, message: string) =>
    logCompletionDecorator<T>(promise, message, filename, logLevel);
}

async function logCompletionDecorator<T>(
  promise: Promise<T>,
  message: string,
  filename: string,
  logLevel: LogLevel,
) {
  const r = await promise;
  logFn(filename)(logLevel, message);
  return r;
}
