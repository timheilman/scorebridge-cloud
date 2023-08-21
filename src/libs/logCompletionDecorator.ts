import { logFn } from "./logging";

export function getLogCompletionDecorator<T>(
  catPrefix: string,
  logLevel: string,
) {
  return (promise: Promise<T>, catSuffix: string, ...addlArgs: unknown[]) =>
    logCompletionDecorator<T>(
      promise,
      catSuffix,
      catPrefix,
      logLevel,
      ...addlArgs,
    );
}

async function logCompletionDecorator<T>(
  promise: Promise<T>,
  catSuffix: string,
  catPrefix: string,
  logLevel: string,
  ...addlArgs: unknown[]
) {
  const r = await promise;
  logFn(catPrefix)(catSuffix, logLevel, ...addlArgs);
  return r;
}
