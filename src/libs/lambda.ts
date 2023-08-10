import { InputValidationError } from "@libs/errors/input-validation-error";
import { UserAlreadyExistsError } from "@libs/errors/user-already-exists-error";
import middy from "@middy/core";
import middyJsonBodyParser from "@middy/http-json-body-parser";
import { Handler } from "aws-lambda";

export const middyJson = (handler: Handler) =>
  middy(handler).use(middyJsonBodyParser());

function errorMiddleware(errorClass) {
  return {
    onError: (request: { error: Error; response: unknown }) => {
      if (request.error instanceof errorClass) {
        // the response vtl template handles this case
        // where the response is { error: { message, type } }
        request.response = {
          error: {
            message: request.error.message,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
            type: errorClass.name,
          },
        };

        return Promise.resolve(request.response);
      }
    },
  };
}

export const middyWithErrorHandling = (handler: Handler) =>
  middy(handler)
    .use(errorMiddleware(Error))
    .use(errorMiddleware(UserAlreadyExistsError))
    .use(errorMiddleware(InputValidationError));
// to get most specific, list from general to specific...
