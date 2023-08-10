import { InputValidationError } from "@libs/errors/input-validation-error";
import { UserAlreadyExistsError } from "@libs/errors/user-already-exists-error";
import middy from "@middy/core";
import middyJsonBodyParser from "@middy/http-json-body-parser";
import { Handler } from "aws-lambda";

export const middyJson = (handler: Handler) =>
  middy(handler).use(middyJsonBodyParser());

// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
console.log(`it: ${InputValidationError}`);
// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
console.log(`it.constructor: ${InputValidationError.constructor}`);
// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
console.log(`it.name: ${InputValidationError.name}`);
// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
console.log(`it.constructor.name: ${InputValidationError.constructor.name}`);
export const inputValidationErrorMiddleware = {
  onError: (request: { error: Error; response: unknown }) => {
    if (request.error instanceof InputValidationError) {
      // the response vtl template handles this case
      // where the response is { error: { message, type } }
      request.response = {
        error: {
          message: request.error.message,
          type: "InputValidationError",
        },
      };

      return Promise.resolve(request.response);
    }
  },
};

export const userAlreadyExistsErrorMiddleware = {
  onError: (request: { error: Error; response: unknown }) => {
    if (request.error instanceof UserAlreadyExistsError) {
      // the response vtl template handles this case
      // where the response is { error: { message, type } }
      request.response = {
        error: {
          message: request.error.message,
          type: "UserAlreadyExistsError",
        },
      };

      return Promise.resolve(request.response);
    }
  },
};
