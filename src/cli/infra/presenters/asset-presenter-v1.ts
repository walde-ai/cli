import { IAssetPresenter } from '@/cli/domain/ports/presenters/i-asset-presenter';
import { ISpinnerComponent } from '@/cli/domain/ports/presenters/components/i-spinner-component';
import { IProgressComponent } from '@/cli/domain/ports/presenters/components/i-progress-component';
import { PresenterConfig } from '@/cli/domain/ports/presenters/presenter-config';
import { CliTheme } from './cli-theme';

/**
 * Asset presenter implementation using component composition
 */
export class AssetPresenterV1 implements IAssetPresenter {
  private errors: Array<{ fileName: string; error: Error }> = [];

  constructor(
    private readonly spinner: ISpinnerComponent,
    private readonly progress: IProgressComponent,
    private readonly config: PresenterConfig
  ) {}

  public startLoading(message: string): void {
    this.spinner.start(message);
  }

  public stopLoading(): void {
    this.spinner.stop();
  }

  public showStarting(folderPath: string): void {
    console.log(CliTheme.body(`Starting asset upload from ${CliTheme.accent(folderPath)}`));
  }

  public startProgress(total: number): void {
    this.progress.start(total);
  }

  public updateProgress(current: number, item: string): void {
    this.progress.update(current, item);
  }

  public stopProgress(): void {
    this.progress.stop();
  }

  public showFileUploaded(fileName: string): void {
    // Progress component handles the display
  }

  public showFileError(fileName: string, error: Error): void {
    this.errors.push({ fileName, error });
  }

  public showUploadSummary(successCount: number, errorCount: number): void {
    if (successCount === 0 && errorCount === 0) {
      console.log(CliTheme.soft('! No files found to upload'));
      return;
    }

    if (errorCount === 0) {
      console.log(CliTheme.accent(`✓ Successfully uploaded all ${successCount} files`));
    } else {
      console.log(CliTheme.soft(`! Upload completed: ${successCount} successful, ${errorCount} failed`));
    }

    if (errorCount > 0) {
      console.log();
      console.log(CliTheme.error('✗ Failed uploads:'));
      for (const { fileName, error } of this.errors) {
        console.log(CliTheme.error(`  • ${fileName}: ${error.message}`));
      }
    }
  }

  public showError(message: string): void {
    console.error(CliTheme.error(`✗ ${message}`));
  }

  public showWarning(message: string): void {
    console.log(CliTheme.soft(`! ${message}`));
  }
}
