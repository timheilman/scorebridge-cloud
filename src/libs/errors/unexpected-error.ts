export class UnexpectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;

    // This clips the constructor invocation from the stack trace
    // it makes the stack trace a little nicer
    Error.captureStackTrace(this, this.constructor);
  }
}
