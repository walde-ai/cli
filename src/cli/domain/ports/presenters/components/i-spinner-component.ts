/**
 * Interface for spinner component
 */
export interface ISpinnerComponent {
  /**
   * Start spinner with message
   */
  start(message: string): void;

  /**
   * Stop spinner
   */
  stop(): void;

  /**
   * Stop spinner with success message
   */
  succeed(spinner: any, message: string): void;

  /**
   * Stop spinner with failure message
   */
  fail(spinner: any, message: string): void;
}
