export class InputValidationError extends Error {
  constructor(message) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    super(message);
    this.name = this.constructor.name;

    // This clips the constructor invocation from the stack trace
    // it makes the stack trace a little nicer
    Error.captureStackTrace(this, this.constructor);
  }
}
