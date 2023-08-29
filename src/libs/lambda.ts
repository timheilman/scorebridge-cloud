import middy from "@middy/core";
import middyJsonBodyParser from "@middy/http-json-body-parser";
import { Handler } from "aws-lambda";

import { logFn } from "../libs/logging";
const log = logFn("src.libs.lambda.");
export const middyJson = (handler: Handler) =>
  middy(handler).use(middyJsonBodyParser());

function errorMiddleware() {
  return {
    onError: (request: { error: Error; response: unknown }) => {
      log("errorMiddleware.onError", "debug", { request });
      log("errorMiddleware.onError.instanceof", "debug", {
        result: request.error instanceof Error,
      });
      if (request.error instanceof Error) {
        // the response vtl template handles this case
        // where the response is { error: { message, type } }
        log("errorMiddleware.onError.settingResponse", "debug", {
          message: request.error.message,

          type: request.error.constructor.name,
        });
        request.response = {
          error: {
            message: request.error.message,

            type: request.error.constructor.name,
          },
        };

        return Promise.resolve(request.response);
      }
    },
  };
}

export const middyWithErrorHandling = (handler: Handler) =>
  middy(handler).use(errorMiddleware());
