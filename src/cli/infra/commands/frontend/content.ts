import { Command } from 'commander';
import { IFrontendContentPresenter } from '@/cli/domain/ports/presenters/i-frontend-content-presenter';
import { CommandFrontendContentGet } from '@/cli/domain/interactors/command-frontend-content-get';
import { Runtime } from '@/cli/infra/runtime';

export type FrontendContentDependencies = {
  presenter: IFrontendContentPresenter;
};

/**
 * Creates the frontend content command
 */
export function createContentCommand(deps: FrontendContentDependencies): Command {
  const command = new Command('content');
  
  command
    .description('Get content by ID, name, or key')
    .requiredOption('--url <url>', 'Frontend URL to load content from')
    .option('--id <id>', 'Content ID')
    .option('--name <name>', 'Content name')
    .option('--key <key>', 'Content key')
    .option('--locale <locale>', 'Content locale', 'en-us')
    .action(async (options) => {
      await executeContentGet(deps, options);
    });

  return command;
}

/**
 * Execute the content get command
 */
async function executeContentGet(deps: FrontendContentDependencies, options: any): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    const command = new CommandFrontendContentGet(deps.presenter);
    await command.execute({
      url: options.url,
      id: options.id,
      name: options.name,
      key: options.key,
      locale: options.locale
    });
  });
}
