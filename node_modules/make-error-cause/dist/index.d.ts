import makeError = require('make-error');
declare function makeErrorCause(value: string | Function): makeErrorCause.Constructor<makeErrorCause.BaseError>;
declare function makeErrorCause<T extends Error>(value: string | Function, _super: {
    new (...args: any[]): T;
}): makeErrorCause.Constructor<T>;
declare namespace makeErrorCause {
    class BaseError extends makeError.BaseError {
        cause: Error;
        constructor(message: string, cause?: Error);
        toString(): string;
    }
    interface Constructor<T> {
        new (message: string, cause?: Error): T;
        super_: any;
        prototype: T;
    }
}
export = makeErrorCause;
