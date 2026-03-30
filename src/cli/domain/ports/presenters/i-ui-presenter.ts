/**
 * UI presenter interface
 */
export interface IUiPresenter {
  /**
   * Start loading indicator
   */
  startLoading(message: string): void;

  /**
   * Stop loading indicator
   */
  stopLoading(): void;

  /**
   * Show UI push starting message
   */
  showStarting(folderPath: string): void;

  /**
   * Start progress tracking for UI upload
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
   * Show file upload success
   */
  showFileUploaded(fileName: string): void;

  /**
   * Show file upload error
   */
  showFileError(fileName: string, error: Error): void;

  /**
   * Show upload summary
   */
  showUploadSummary(successCount: number, errorCount: number): void;

  /**
   * Show error
   */
  showError(message: string): void;

  /**
   * Show a non-fatal warning message
   */
  showWarning(message: string): void;
}
