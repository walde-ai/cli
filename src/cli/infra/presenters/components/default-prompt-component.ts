import inquirer from 'inquirer';
import { IPromptComponent } from '@/cli/domain/ports/presenters/components/i-prompt-component';

/**
 * Default prompt component using inquirer
 */
export class DefaultPromptComponent implements IPromptComponent {
  /**
   * Prompt for text input
   */
  public async text(message: string): Promise<string> {
    const { value } = await inquirer.prompt<{ value: string }>({
      type: 'input',
      name: 'value',
      message
    });
    return value;
  }

  /**
   * Prompt for password input
   */
  public async password(message: string): Promise<string> {
    const { value } = await inquirer.prompt<{ value: string }>({
      type: 'password',
      name: 'value',
      message
    });
    return value;
  }

  /**
   * Prompt for selection from list
   */
  public async select(message: string, choices: Array<{ name: string; value: string }>): Promise<string> {
    const { value } = await inquirer.prompt<{ value: string }>({
      type: 'list',
      name: 'value',
      message,
      choices,
      pageSize: 10
    });
    return value;
  }

  /**
   * Prompt for confirmation
   */
  public async confirm(message: string): Promise<boolean> {
    const { value } = await inquirer.prompt<{ value: boolean }>({
      type: 'confirm',
      name: 'value',
      message,
      default: true
    });
    return value;
  }
}
