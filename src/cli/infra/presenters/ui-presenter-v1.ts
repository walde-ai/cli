import { IUiPresenter } from '@/cli/domain/ports/presenters/i-ui-presenter';
import { ISpinnerComponent } from '@/cli/domain/ports/presenters/components/i-spinner-component';
import { IProgressComponent } from '@/cli/domain/ports/presenters/components/i-progress-component';
import { PresenterConfig } from '@/cli/domain/ports/presenters/presenter-config';
import { CliTheme } from './cli-theme';

/**
 * UI presenter implementation using component composition
 */
export class UiPresenterV1 implements IUiPresenter {
  private errors: Array<{ fileName: string; error: Error }> = [];

  constructor(
    private readonly spinner: ISpinnerComponent,
    private readonly progress: IProgressComponent,
    private readonly config: PresenterConfig
  ) {}

  /**
   * Start loading indicator
   */
  public startLoading(message: string): void {
    this.spinner.start(message);
  }

  /**
   * Stop loading indicator
   */
  public stopLoading(): void {
    this.spinner.stop();
  }

  /**
   * Show UI push starting message
   */
  public showStarting(folderPath: string): void {
    console.log(CliTheme.accent(`Starting UI upload from ${CliTheme.body(folderPath)}`));
  }

  /**
   * Start progress tracking for UI upload
   */
  public startProgress(total: number): void {
    this.progress.start(total);
  }

  /**
   * Update progress with current item
   */
  public updateProgress(current: number, item: string): void {
    this.progress.update(current, item);
  }

  /**
   * Stop progress tracking
   */
  public stopProgress(): void {
    this.progress.stop();
  }

  /**
   * Show file upload success
   */
  public showFileUploaded(fileName: string): void {
    // Progress component handles the display
  }

  /**
   * Show file upload error
   */
  public showFileError(fileName: string, error: Error): void {
    this.errors.push({ fileName, error });
  }

  /**
   * Show upload summary
   */
  public showUploadSummary(successCount: number, errorCount: number): void {
    if (errorCount === 0) {
      console.log(CliTheme.accent(`✓ Successfully uploaded all ${successCount} files!`));
    } else {
      console.log(CliTheme.soft('! Upload completed: ') + CliTheme.accent(`${successCount}`) + CliTheme.soft(' successful, ') + CliTheme.error(`${errorCount}`) + CliTheme.soft(' failed'));
    }

    if (errorCount > 0) {
      console.log();
      console.log(CliTheme.error('✗ Failed uploads:'));
      for (const { fileName, error } of this.errors) {
        console.log(CliTheme.error(`   • ${fileName}: ${error.message}`));
      }
    }

    if (successCount === 0 && errorCount === 0) {
      console.log(CliTheme.soft('No files found to upload'));
    }
  }

  /**
   * Show error
   */
  public showError(message: string): void {
    console.log(CliTheme.error(`✗ ${message}`));
  }

  /**
   * Show a non-fatal warning
   */
  public showWarning(message: string): void {
    console.log(CliTheme.soft(`! ${message}`));
  }
}
