import Table from 'cli-table3';
import { IContentPresenter } from '@/cli/domain/ports/presenters/i-content-presenter';
import { ISpinnerComponent } from '@/cli/domain/ports/presenters/components/i-spinner-component';
import { IProgressComponent } from '@/cli/domain/ports/presenters/components/i-progress-component';
import { PresenterConfig } from '@/cli/domain/ports/presenters/presenter-config';
import { Content, ContentState } from '@walde.ai/sdk';
import { CliTheme } from './cli-theme';

/**
 * Content presenter V1 implementation
 */
export class ContentPresenterV1 implements IContentPresenter {
  private failedFiles: Array<{ file: string; error: string }> = [];
  private currentProgress = { current: 0, total: 0 };

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
   * Present list of contents
   */
  public presentContents(contents: Content[]): void {
    if (contents.length === 0) {
      console.log(CliTheme.soft('No contents found.'));
      return;
    }

    const table = new Table({
      head: ['', CliTheme.accent('ID'), CliTheme.accent('Key'), CliTheme.accent('Name'), CliTheme.accent('State')],
      style: {
        head: [],
        border: [],
        'padding-left': 0,
        'padding-right': 2
      },
      chars: {
        'top': '', 'top-mid': '', 'top-left': '', 'top-right': '',
        'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
        'left': '', 'left-mid': '', 'mid': '', 'mid-mid': '',
        'right': '', 'right-mid': '', 'middle': ' '
      }
    });

    const lineNumWidth = String(contents.length).length + 2;

    contents.forEach((content, index) => {
      let stateColor;
      if (content.state === ContentState.PUBLISHED) {
        stateColor = CliTheme.accent;
      } else if (content.state === ContentState.DELETED) {
        stateColor = CliTheme.soft;
      } else {
        stateColor = CliTheme.soft;
      }

      const lineNum = String(index + 1).padStart(lineNumWidth - 1);

      table.push([
        CliTheme.soft(lineNum),
        CliTheme.body(content.id || 'N/A'),
        CliTheme.body(content.key),
        CliTheme.body(content.name),
        stateColor(content.state)
      ]);
    });

    console.log(table.toString());
    console.log(CliTheme.soft(`\nTotal: ${contents.length} content${contents.length === 1 ? '' : 's'}`));
  }

  /**
   * Start progress tracking for bulk operations
   */
  public startProgress(total: number): void {
    this.currentProgress = { current: 0, total };
    this.progress.start(total);
  }

  /**
   * Update progress with current item
   */
  public updateProgress(current: number, item: string): void {
    this.currentProgress = { current, total: this.currentProgress.total };
    // Don't show anything here, wait for success/error to show the complete line
  }

  /**
   * Stop progress tracking
   */
  public stopProgress(): void {
    this.progress.stop();
  }

  /**
   * Show content push success
   */
  public showContentPushed(contentKey: string): void {
    if (this.currentProgress.total > 0) {
      this.showProgressWithResult(contentKey, true);
    } else {
      console.log(CliTheme.accent(`✓ ${contentKey}`));
    }
  }

  /**
   * Show content push error
   */
  public showContentError(contentKey: string, error: Error): void {
    this.showProgressWithResult(contentKey, false, error.message);
    this.failedFiles.push({ file: contentKey, error: error.message });
  }

  /**
   * Show progress bar with file result
   */
  private showProgressWithResult(filename: string, success: boolean, error?: string): void {
    const { current, total } = this.currentProgress;
    const percentage = Math.round((current / total) * 100);
    const barLength = 20;
    const filledLength = Math.round((current / total) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    
    const statusIcon = success ? CliTheme.accent('✓') : CliTheme.error('✗');
    const statusText = success ? filename : `${filename}: ${error}`;
    
    // Override previous line and show progress + result
    process.stdout.write(`\r${CliTheme.accent(`[${bar}]`)} ${percentage}% (${current}/${total}) ${statusIcon} ${statusText}`);
    
    // Move to next line if this is the last item
    if (current === total) {
      console.log();
    }
  }

  /**
   * Show push summary
   */
  public showPushSummary(successCount: number, errorCount: number): void {
    console.log();
    if (errorCount === 0) {
      console.log(CliTheme.accent(`✓ All ${successCount} files pushed successfully`));
    } else {
      console.log(CliTheme.accent(`✓ ${successCount} files pushed successfully`));
      console.log(CliTheme.error(`✗ ${errorCount} files failed`));
      
      // Show failed files with their errors
      if (this.failedFiles.length > 0) {
        console.log();
        console.log(CliTheme.error('Failed files:'));
        this.failedFiles.forEach(({ file, error }) => {
          console.log(CliTheme.error(`  • ${file}: ${error}`));
        });
      }
    }
    
    // Reset failed files for next operation
    this.failedFiles = [];
    this.currentProgress = { current: 0, total: 0 };
  }

  /**
   * Show error
   */
  public showError(message: string): void {
    console.error(CliTheme.error(`✗ Error: ${message}`));
  }

  /**
   * Show a non-fatal warning
   */
  public showWarning(message: string): void {
    console.log(CliTheme.soft(`! ${message}`));
  }
}
