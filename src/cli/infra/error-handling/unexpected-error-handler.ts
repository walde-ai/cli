import { WaldeUnexpectedError } from '@walde.ai/sdk';
import { ErrorHandler } from './base-error-handler';

/**
 * Handles unexpected errors by showing message and cause details
 */
export class UnexpectedErrorHandler extends ErrorHandler<WaldeUnexpectedError> {
  handle(error: WaldeUnexpectedError): void {
    console.error(error.message);
    
    if (error.cause) {
      console.error(`Caused by: ${error.cause.message}`);
      if (error.cause.stack) {
        console.error(error.cause.stack);
      }
    }
    process.exit(1);
  }
}
