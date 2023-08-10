import { ValidationError } from "@libs/validation-error";
import middy from "@middy/core";
import middyJsonBodyParser from "@middy/http-json-body-parser";
import { Handler } from "aws-lambda";

export const middyJson = (handler: Handler) =>
  middy(handler).use(middyJsonBodyParser());

export const middyValidation = (handler: Handler) => {
  return middy(handler).use({
    onError: (request: { error: Error; response: unknown }) => {
      if (request.error instanceof ValidationError) {
        // the response vtl template handles this case
        // where the response is { error: { message, type } }
        request.response = {
          error: {
            message: request.error.message,
            type: "ValidationError",
          },
        };

        return Promise.resolve(request.response);
      }
    },
  });
};
