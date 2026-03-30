/**
 * Presenter interface for cache invalidation operations.
 */
export interface ICachePresenter {
  /**
   * Start spinner while the invalidation request is in-flight.
   */
  startLoading(message: string): void;

  /**
   * Stop the spinner.
   */
  stopLoading(): void;

  /**
   * Show a successful invalidation result.
   */
  showInvalidated(invalidationId: string): void;

  /**
   * Show an error message.
   */
  showError(message: string): void;

  /**
   * Show a non-fatal warning (e.g. failed invalidation after a successful push).
   */
  showWarning(message: string): void;
}
