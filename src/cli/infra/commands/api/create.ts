import { Command } from 'commander';
import { Runtime } from '@/cli/infra/runtime';
import { CommandApiCreate } from '@/cli/domain/interactors/command-api-create';

export type ApiCreateDependencies = Record<string, never>;

export function createApiCreateCommand(_deps: ApiCreateDependencies): Command {
  const command = new Command('create');

  command
    .description('Scaffold a new cloud API endpoint')
    .requiredOption('--name <Name>', 'PascalCase class name for the API (e.g. MyApi)')
    .option('--target-path <path>', 'Project root path (defaults to the nearest workspace root)')
    .action(async (options) => {
      const runtime = new Runtime();
      await runtime.run(async () => {
        const interactor = new CommandApiCreate();
        await interactor.execute({
          name: options.name,
          targetPath: options.targetPath,
        });
      });
    });

  return command;
}
