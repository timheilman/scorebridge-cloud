import { logFn } from "./logging";

export function getLogCompletionDecorator<T>(
  catPrefix: string,
  logLevel: string,
) {
  return (promise: Promise<T>, catSuffix: string) =>
    logCompletionDecorator<T>(promise, catSuffix, catPrefix, logLevel);
}

async function logCompletionDecorator<T>(
  promise: Promise<T>,
  catSuffix: string,
  catPrefix: string,
  logLevel: string,
) {
  const r = await promise;
  logFn(catPrefix)(catSuffix, logLevel);
  return r;
}
