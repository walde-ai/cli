import ora, { Ora } from 'ora';
import { ISpinnerComponent } from '@/cli/domain/ports/presenters/components/i-spinner-component';

/**
 * Default spinner component using ora
 */
export class DefaultSpinnerComponent implements ISpinnerComponent {
  private spinner?: Ora;

  /**
   * Start spinner with message
   */
  public start(message: string): void {
    this.spinner = ora(message).start();
  }

  /**
   * Stop spinner
   */
  public stop(): void {
    if (this.spinner) {
      this.spinner.stop();
      this.spinner = undefined;
    }
  }

  /**
   * Stop spinner with success message
   */
  public succeed(spinner: any, message: string): void {
    if (spinner) {
      spinner.succeed(message);
    }
  }

  /**
   * Stop spinner with failure message
   */
  public fail(spinner: any, message: string): void {
    if (spinner) {
      spinner.fail(message);
    }
  }
}
