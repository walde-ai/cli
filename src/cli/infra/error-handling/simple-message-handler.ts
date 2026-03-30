import { ErrorHandler } from './base-error-handler';

/**
 * Handles errors by displaying message and exiting with code 1
 */
export class SimpleMessageHandler extends ErrorHandler<{ message: string }> {
  handle(error: { message: string }): void {
    console.error(error.message);
    process.exit(1);
  }
}
