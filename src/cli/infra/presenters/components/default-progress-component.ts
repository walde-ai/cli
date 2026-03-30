import chalk from 'chalk';
import { IProgressComponent } from '@/cli/domain/ports/presenters/components/i-progress-component';

/**
 * Default progress component with progress bar
 */
export class DefaultProgressComponent implements IProgressComponent {
  private total: number = 0;
  private current: number = 0;

  /**
   * Start progress tracking
   */
  public start(total: number): void {
    this.total = total;
    this.current = 0;
    console.log(chalk.blue(`Starting operation with ${total} items...`));
  }

  /**
   * Update progress with current item
   */
  public update(current: number, item: string): void {
    this.current = current;
    const percentage = Math.round((current / this.total) * 100);
    const barLength = 20;
    const filledLength = Math.round((current / this.total) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    
    // Just show progress bar and percentage, don't show the item name here
    process.stdout.write(`\r${chalk.cyan(`[${bar}]`)} ${percentage}% (${current}/${this.total})`);
  }

  /**
   * Stop progress tracking
   */
  public stop(): void {
    if (this.current > 0) {
      console.log(); // New line after progress bar
    }
  }
}
