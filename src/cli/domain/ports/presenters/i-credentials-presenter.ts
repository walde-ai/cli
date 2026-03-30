import { ParsedCredentials } from '@/cli/domain/ports/out/credential-parser';

/**
 * Interface for credentials-related user interactions
 */
export interface ICredentialsPresenter {
  /**
   * Display parsed credentials to user
   */
  display(parsedCredentials: ParsedCredentials): void;

  /**
   * Display error when no credentials found
   */
  displayNoCredentials(): void;

  /**
   * Start refresh process
   */
  startRefresh(): void;

  /**
   * Show successful refresh
   */
  showRefreshSuccess(): void;

  /**
   * Show failed refresh with error message
   */
  showRefreshError(errorMessage: string): void;
}
