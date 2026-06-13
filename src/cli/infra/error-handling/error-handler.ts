import { UserError, SystemError, BaseError, CancellationError } from '@/cli/domain/exceptions';
import { 
  WaldeError, 
  WaldeUserError, 
  WaldeSystemError, 
  WaldeUnexpectedError 
} from '@walde.ai/sdk';
import { SimpleMessageHandler } from './simple-message-handler';
import { SystemErrorHandler } from './system-error-handler';
import { UnexpectedErrorHandler } from './unexpected-error-handler';
import { WaldeErrorHandler } from './walde-error-handler';
import { WaldeSystemErrorHandler } from './walde-system-error-handler';
import { ErrorHandler as BaseErrorHandler } from './base-error-handler';
import { CancellationErrorHandler } from './cancellation-error-handler';

enum ErrorType {
  CANCELLATION,
  USER_ERROR,
  WALDE_USER_ERROR,
  WALDE_ERROR,
  WALDE_SYSTEM_ERROR,
  WALDE_UNEXPECTED_ERROR,
  CLI_SYSTEM_ERROR,
  CLI_BASE_ERROR,
  UNKNOWN
}

/**
 * Handles error display and exit codes for CLI commands using map-based casting and handling
 */
export class ErrorHandler {
  private handlerFactories: Map<ErrorType, () => BaseErrorHandler<any>> = new Map([
    [ErrorType.CANCELLATION, () => new CancellationErrorHandler()],
    [ErrorType.USER_ERROR, () => new SimpleMessageHandler()],
    [ErrorType.WALDE_USER_ERROR, () => new WaldeErrorHandler()],
    [ErrorType.WALDE_ERROR, () => new WaldeErrorHandler()],
    [ErrorType.WALDE_SYSTEM_ERROR, () => new WaldeSystemErrorHandler()],
    [ErrorType.WALDE_UNEXPECTED_ERROR, () => new UnexpectedErrorHandler()],
    [ErrorType.CLI_SYSTEM_ERROR, () => new SystemErrorHandler()],
    [ErrorType.CLI_BASE_ERROR, () => new SystemErrorHandler()]
  ]);

  /**
   * Detect error type based on instance checks
   */
  private detect(error: any): ErrorType {
    if (error instanceof CancellationError) return ErrorType.CANCELLATION;
    if (error instanceof WaldeUnexpectedError) return ErrorType.WALDE_UNEXPECTED_ERROR;
    if (error instanceof WaldeUserError) return ErrorType.WALDE_USER_ERROR;
    if (error instanceof WaldeSystemError) return ErrorType.WALDE_SYSTEM_ERROR;
    if (error instanceof WaldeError) return ErrorType.WALDE_ERROR;
    if (error instanceof UserError) return ErrorType.USER_ERROR;
    if (error instanceof SystemError) return ErrorType.CLI_SYSTEM_ERROR;
    if (error instanceof BaseError) return ErrorType.CLI_BASE_ERROR;
    return ErrorType.UNKNOWN;
  }

  /**
   * Handle error with appropriate display and exit code
   */
  handle(error: any): void {
    const errorType = this.detect(error);
    
    if (errorType === ErrorType.UNKNOWN) {
      // Handle unknown errors with UnexpectedErrorHandler instead of re-throwing
      const handler = new UnexpectedErrorHandler();
      handler.handle(error);
      return;
    }

    const handlerFactory = this.handlerFactories.get(errorType)!;
    const handler = handlerFactory();
    const castError = handler.cast(error);
    handler.handle(castError);
  }
}
