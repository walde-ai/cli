import { Command } from 'commander';
import { Runtime } from '@/cli/infra/runtime';
import { CredentialsProvider } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IFormatPresenter } from '@/cli/domain/ports/presenters/i-format-presenter';
import { CommandFormatDelete } from '@/cli/domain/interactors/format/command-format-delete';

export type FormatDeleteDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IFormatPresenter;
};

/**
 * Creates the `format delete <formatId>` subcommand.
 */
export function createFormatDeleteCommand(deps: FormatDeleteDependencies): Command {
  const command = new Command('delete');

  command
    .description('Delete a custom post format')
    .argument('<formatId>', 'Format ID to delete')
    .option('--project <projectId>', 'Project ID (defaults to the active workspace project)')
    .option('--confirm', 'Skip the interactive confirmation prompt')
    .action(async (formatId: string, options: { project?: string; confirm?: boolean }) => {
      const runtime = new Runtime();
      await runtime.run(async () => {
        const interactor = new CommandFormatDelete(
          deps.credentialsProvider,
          deps.presenter,
          deps.configLoader
        );
        await interactor.execute(formatId, {
          projectId: options.project,
          confirm: options.confirm,
        });
      });
    });

  return command;
}
