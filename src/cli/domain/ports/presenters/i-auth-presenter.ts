/**
 * Authentication error codes
 */
export enum AuthErrorCode {
  INVALID_USER_OR_PASSWORD = 'INVALID_USER_OR_PASSWORD',
  NOT_CONFIRMED = 'NOT_CONFIRMED',
  GENERIC_ERROR = 'GENERIC_ERROR'
}

/**
 * Authentication presenter interface
 */
export interface IAuthPresenter {
  /**
   * Request username from user
   */
  requestUser(): Promise<string>;

  /**
   * Request password from user
   */
  requestPassword(): Promise<string>;

  /**
   * Request new password from user
   */
  requestNewPassword(): Promise<string>;

  /**
   * Start authentication process
   */
  start(): void;

  /**
   * Stop authentication process
   */
  stop(): void;

  /**
   * Indicate successful authentication
   */
  succeed(): void;

  /**
   * Indicate failed authentication with error code
   */
  fail(code: AuthErrorCode, error?: Error): void;
}
