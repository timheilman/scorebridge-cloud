import { logFn } from "./logging";

export function getLogCompletionDecorator<T>(
  filename: string,
  logLevel: string,
) {
  return (promise: Promise<T>, catSuffix: string) =>
    logCompletionDecorator<T>(promise, catSuffix, filename, logLevel);
}

async function logCompletionDecorator<T>(
  promise: Promise<T>,
  catSuffix: string,
  filename: string,
  logLevel: string,
) {
  const r = await promise;
  logFn(filename)(catSuffix, logLevel);
  return r;
}
