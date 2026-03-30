import { ErrorHandler } from './error-handling/error-handler';

/**
 * Runtime provides standardized error handling for command execution
 */
export class Runtime {
  /**
   * Execute a function with standardized error handling
   */
  async run(fn: () => Promise<void>): Promise<void> {
    try {
      await fn();
    } catch (error: any) {
      const errorHandler = new ErrorHandler();
      errorHandler.handle(error);
    }
  }
}
