/**
 * Interface for prompt component
 */
export interface IPromptComponent {
  text(message: string): Promise<string>;
  password(message: string): Promise<string>;
  select(message: string, choices: Array<{ name: string; value: string }>): Promise<string>;
  confirm(message: string, defaultValue: boolean): Promise<boolean>;
}
