import { ParsedCredentials } from '@/cli/domain/ports/out/credential-parser';

/**
 * Presenter interface for credential operations
 */
export interface ICredentialsPresenterV1 {
  /**
   * Display parsed credentials to user
   */
  displayCredentials(parsedCredentials: ParsedCredentials): void;

  /**
   * Display error when no credentials found
   */
  displayNoCredentials(): void;

  /**
   * Start loading indicator for refresh operation
   */
  startRefreshLoading(): void;

  /**
   * Stop loading and show success message for refresh
   */
  showRefreshSuccess(): void;

  /**
   * Stop loading and show error message for refresh
   */
  showRefreshError(errorMessage: string): void;
}
