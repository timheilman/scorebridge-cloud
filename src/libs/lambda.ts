import middy from "@middy/core";
import middyJsonBodyParser from "@middy/http-json-body-parser";
import { Handler } from "aws-lambda";

export const middyJson = (handler: Handler) =>
  middy(handler).use(middyJsonBodyParser());

function errorMiddleware() {
  return {
    onError: (request: { error: Error; response: unknown }) => {
      if (request.error instanceof Error) {
        // the response vtl template handles this case
        // where the response is { error: { message, type } }
        request.response = {
          error: {
            message: request.error.message,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
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
