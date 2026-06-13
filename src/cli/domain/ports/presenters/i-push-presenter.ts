/**
 * Interface for push command step-by-step output
 */
export interface IPushPresenter {
  startStep(label: string): void;
  completeStep(elapsedMs: number): void;
  failStep(error: Error): void;
  presentError(error: Error): void;
}
