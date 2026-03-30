import chalk from 'chalk';
import { WaldeError } from '@walde.ai/sdk';
import { ErrorHandler } from './base-error-handler';

/**
 * Handles Walde errors by showing message and details if present
 */
export class WaldeErrorHandler extends ErrorHandler<WaldeError> {
  handle(error: WaldeError): void {
    console.error(chalk.red(`✗ Error: ${error.message}`));
    
    if (error.details) {
      console.error(`Details: ${JSON.stringify(error.details, null, 2)}`);
    }
    
    process.exit(1);
  }
}
