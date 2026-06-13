import inquirer from 'inquirer';
import { IPromptComponent } from '@/cli/domain/ports/presenters/components/i-prompt-component';
import { CancellationError } from '@/cli/domain/exceptions';
import { CliTheme } from '../cli-theme';

/**
 * Default prompt component using inquirer and custom raw terminal input
 */
export class DefaultPromptComponent implements IPromptComponent {
  public async text(message: string): Promise<string> {
    const { value } = await inquirer.prompt<{ value: string }>({
      type: 'input',
      name: 'value',
      message
    });
    return value;
  }

  public async password(message: string): Promise<string> {
    const { value } = await inquirer.prompt<{ value: string }>({
      type: 'password',
      name: 'value',
      message
    });
    return value;
  }

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

  public async confirm(message: string, defaultValue: boolean): Promise<boolean> {
    const stdin = process.stdin;

    if (!process.stdin.isTTY || typeof stdin.setRawMode !== 'function') {
      const { value } = await inquirer.prompt<{ value: boolean }>({
        type: 'confirm',
        name: 'value',
        message,
        default: defaultValue
      });
      return value;
    }

    let selected = defaultValue;

    const render = (): void => {
      const yes = selected ? CliTheme.accent('▸ Yes') : CliTheme.soft('  Yes');
      const no = !selected ? CliTheme.accent('▸ No') : CliTheme.soft('  No');
      process.stdout.write(`\r${message} ${yes}  ${no}  `);
    };

    return new Promise<boolean>((resolvePromise, rejectPromise) => {
      const wasRaw = stdin.isRaw;
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding('utf8');

      render();

      const onData = (key: string): void => {
        if (key === '\u001b[D' || key === '\u001b[C') {
          selected = !selected;
          render();
        } else if (key === '\r' || key === '\n') {
          stdin.removeListener('data', onData);
          stdin.setRawMode(wasRaw ?? false);
          stdin.pause();
          process.stdout.write('\n');
          resolvePromise(selected);
        } else if (key === '\u0003') {
          stdin.removeListener('data', onData);
          stdin.setRawMode(wasRaw ?? false);
          stdin.pause();
          rejectPromise(new CancellationError('Operation cancelled by user'));
        }
      };

      stdin.on('data', onData);
    });
  }
}
