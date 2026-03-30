import { Content } from '@walde.ai/sdk';

/**
 * Content presenter interface
 */
export interface IContentPresenter {
  /**
   * Start loading indicator
   */
  startLoading(message: string): void;

  /**
   * Stop loading indicator
   */
  stopLoading(): void;

  /**
   * Present list of contents
   */
  presentContents(contents: Content[]): void;

  /**
   * Start progress tracking for bulk operations
   */
  startProgress(total: number): void;

  /**
   * Update progress with current item
   */
  updateProgress(current: number, item: string): void;

  /**
   * Stop progress tracking
   */
  stopProgress(): void;

  /**
   * Show content push success
   */
  showContentPushed(contentKey: string): void;

  /**
   * Show content push error
   */
  showContentError(contentKey: string, error: Error): void;

  /**
   * Show push summary
   */
  showPushSummary(successCount: number, errorCount: number): void;

  /**
   * Show error
   */
  showError(message: string): void;

  /**
   * Show a non-fatal warning message
   */
  showWarning(message: string): void;
}
