import { Command } from 'commander';
import { Runtime } from '@/cli/infra/runtime';
import { CredentialsProvider } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IFormatPresenter } from '@/cli/domain/ports/presenters/i-format-presenter';
import { CommandFormatList } from '@/cli/domain/interactors/format/command-format-list';

export type FormatListDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IFormatPresenter;
};

/**
 * Creates the `format list` subcommand.
 */
export function createFormatListCommand(deps: FormatListDependencies): Command {
  const command = new Command('list');

  command
    .description("List the active project's custom post formats")
    .option('--project <projectId>', 'Project ID (defaults to the active workspace project)')
    .action(async (options) => {
      const runtime = new Runtime();
      await runtime.run(async () => {
        const interactor = new CommandFormatList(
          deps.credentialsProvider,
          deps.presenter,
          deps.configLoader
        );
        await interactor.execute({
          projectId: options.project,
        });
      });
    });

  return command;
}
