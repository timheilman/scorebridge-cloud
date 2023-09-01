// usage:
// import { logFactory } from "mount/point/of/submodule"
// import { logCompletionDecoratorFactory } from "mount/point/of/submodule"
// import { logFn } from "repo-specific-logging-lib"
// const catPrefix = "src.foo.bar.file.fn.";
// const log = logFn(catPrefix);
// const lcd = logCompletionDecoratorFactory(logFn, catPrefix, "debug", "error");
// log("step.outcome", "debug", { other: "stuff" })
// lcd(new Promise((res, rej) => { setTimeout(500, () => {
//       res() or rej()
//     }) }),
//     "async.step.descr", { other: "stuff"});

type LogType = (
  catSuffix: string,
  logLevel: string,
  ...addlArgs: unknown[]
) => void;

type LogFnType = (catPrefix: string) => LogType;

type LcdType<PROMISE_RETURN_TYPE> = (
  promise: Promise<PROMISE_RETURN_TYPE>,
  catSuffix: string,
  ...addlArgs: unknown[]
) => Promise<PROMISE_RETURN_TYPE>;

export const logCompletionDecoratorFactory = <PROMISE_RETURN_TYPE>(
  logFn: LogFnType,
  catPrefix: string,
  successLevel = "debug",
  errLevel = "error",
): LcdType<PROMISE_RETURN_TYPE> => {
  const unfixedLevels = (
    promise: Promise<PROMISE_RETURN_TYPE>,
    catSuffix: string,
    logLevel: string,
    errLogLevel: string,
    ...addlArgs: unknown[]
  ) =>
    logCompletionDecorator<PROMISE_RETURN_TYPE>(
      logFn,
      promise,
      catPrefix,
      catSuffix,
      logLevel,
      errLogLevel,
      ...addlArgs,
    );
  return (
    promise: Promise<PROMISE_RETURN_TYPE>,
    catSuffix: string,
    ...addlArgs: unknown[]
  ) => {
    return unfixedLevels(
      promise,
      catSuffix,
      successLevel,
      errLevel,
      ...addlArgs,
    );
  };
};
async function logCompletionDecorator<PROMISE_RETURN_TYPE>(
  logFn: LogFnType,
  promise: Promise<PROMISE_RETURN_TYPE>,
  catPrefix: string,
  catSuffix: string,
  logLevel: string,
  errLogLevel: string,
  ...addlArgs: unknown[]
) {
  logFn(catPrefix)(`${catSuffix}.begin`, logLevel, ...addlArgs);
  try {
    const r = await promise;
    logFn(catPrefix)(`${catSuffix}.end.success`, logLevel, ...addlArgs);
    return r;
  } catch (e: unknown) {
    logFn(catPrefix)(
      `${catSuffix}.end.error`,
      errLogLevel,
      ...[e, ...addlArgs],
    );
    throw e;
  }
}
