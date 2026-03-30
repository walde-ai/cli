import chalk from 'chalk';
import { WaldeSystemError } from '@walde.ai/sdk';
import { ErrorHandler } from './base-error-handler';

/**
 * Handles Walde system errors by showing message, details, and cause if present
 */
export class WaldeSystemErrorHandler extends ErrorHandler<WaldeSystemError> {
  handle(error: WaldeSystemError): void {
    console.error(chalk.red(`✗ Error: ${error.message}`));
    
    if (error.details) {
      console.error(`Details: ${JSON.stringify(error.details, null, 2)}`);
    }
    
    if (error.cause) {
      console.error(`Caused by: ${error.cause.message}`);
      if (error.cause.stack) {
        console.error(error.cause.stack);
      }
    }
    
    process.exit(1);
  }
}
