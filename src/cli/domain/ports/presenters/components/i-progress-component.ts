/**
 * Interface for progress component
 */
export interface IProgressComponent {
  /**
   * Start progress tracking
   */
  start(total: number): void;

  /**
   * Update progress with current item
   */
  update(current: number, item: string): void;

  /**
   * Stop progress tracking
   */
  stop(): void;
}
