/**
 * Interface for prompt component
 */
export interface IPromptComponent {
  /**
   * Prompt for text input
   */
  text(message: string): Promise<string>;

  /**
   * Prompt for password input
   */
  password(message: string): Promise<string>;

  /**
   * Prompt for selection from list
   */
  select(message: string, choices: Array<{ name: string; value: string }>): Promise<string>;

  /**
   * Prompt for confirmation
   */
  confirm(message: string): Promise<boolean>;
}
