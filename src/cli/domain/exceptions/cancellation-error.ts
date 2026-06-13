import { BaseError } from './base-error';

/**
 * Error thrown when a user cancels an interactive operation (e.g. Ctrl+C in a prompt)
 */
export class CancellationError extends BaseError {
}
