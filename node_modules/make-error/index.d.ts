/**
 * Create a new error constructor instance.
 */
declare function makeError(name: string): makeError.Constructor<makeError.BaseError>;

/**
 * Set the constructor prototype to `BaseError`.
 */
declare function makeError<T extends Error>(super_: { new (...args: any[]): T }): makeError.Constructor<T & makeError.BaseError>;

/**
 * Create a specialized error instance.
 */
declare function makeError<T extends Error>(name: string | Function, super_: { new (...args: any[]): T }): makeError.Constructor<T>;

declare module makeError {
  /**
   * Use with ES2015+ inheritance.
   */
  export class BaseError implements Error {
    message: string;
    name: string;
    stack: string;

    constructor(message?: string);
  }

  export interface Constructor <T> {
    new (message?: string): T
    super_: any
    prototype: T
  }
}

export = makeError;
