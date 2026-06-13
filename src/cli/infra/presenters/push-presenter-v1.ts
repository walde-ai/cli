import { IPushPresenter } from '@/cli/domain/ports/presenters/i-push-presenter';
import { CliTheme } from './cli-theme';

/**
 * Push presenter that displays step-by-step timing output with inline updates
 */
export class PushPresenterV1 implements IPushPresenter {
  private currentLabel: string = '';

  public startStep(label: string): void {
    this.currentLabel = label;
    process.stdout.write(label);
  }

  public completeStep(elapsedMs: number): void {
    const seconds = (elapsedMs / 1000).toFixed(3);
    process.stdout.write(`\r${CliTheme.accent('✓')} ${this.currentLabel} ${CliTheme.soft(`(${seconds}s)`)}\n`);
  }

  public failStep(error: Error): void {
    process.stdout.write(`\r${CliTheme.error('✗')} ${this.currentLabel} ${CliTheme.error(error.message)}\n`);
  }

  public presentError(error: Error): void {
    console.error(CliTheme.error(`Error: ${error.message}`));
  }
}
