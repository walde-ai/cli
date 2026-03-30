import chalk from 'chalk';
import { ErrorHandler } from './base-error-handler';
import { BaseError } from '@/cli/domain/exceptions';

/**
 * Handles system errors by displaying message and exiting with code 1
 */
export class SystemErrorHandler extends ErrorHandler<BaseError> {
  handle(error: BaseError): void {
    console.error(chalk.red(`✗ Error: ${error.message}`));

    if (error.cause) {
      const cause = error.cause instanceof Error ? error.cause.message : String(error.cause);
      console.error(`Caused by: ${cause}`);
    }

    process.exit(1);
  }
}
