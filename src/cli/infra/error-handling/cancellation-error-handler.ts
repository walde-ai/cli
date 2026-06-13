import { ErrorHandler } from './base-error-handler';

/**
 * Handles CancellationError by exiting cleanly with code 0
 */
export class CancellationErrorHandler extends ErrorHandler<{ message: string }> {
  handle(_error: { message: string }): void {
    process.exit(0);
  }
}
