/**
 * Base error handler with type casting capability
 */
export abstract class ErrorHandler<T> {
  abstract handle(error: T): void;

  cast(error: any): T {
    return error as T;
  }
}
