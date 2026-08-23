import { Command } from 'commander';
import { Runtime } from '@/cli/infra/runtime';
import { CredentialsProvider } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IFormatPresenter } from '@/cli/domain/ports/presenters/i-format-presenter';
import { CommandFormatEdit } from '@/cli/domain/interactors/format/command-format-edit';

export type FormatEditDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IFormatPresenter;
};

/**
 * Creates the `format edit <formatId>` subcommand.
 */
export function createFormatEditCommand(deps: FormatEditDependencies): Command {
  const command = new Command('edit');

  command
    .description('Replace a custom post format definition')
    .argument('<formatId>', 'Format ID to edit')
    .option('--project <projectId>', 'Project ID (defaults to the active workspace project)')
    .option('--name <name>', 'Replacement format name (otherwise prompted with the current name)')
    .option(
      '--field <spec>',
      'Replacement field definition as name:type:default (repeatable; the full set replaces the stored one)',
      (value: string, previous: string[]) => previous.concat([value]),
      [] as string[]
    )
    .action(async (formatId: string, options) => {
      const runtime = new Runtime();
      await runtime.run(async () => {
        const interactor = new CommandFormatEdit(
          deps.credentialsProvider,
          deps.presenter,
          deps.configLoader
        );
        await interactor.execute(formatId, {
          projectId: options.project,
          name: options.name,
          fields: options.field,
        });
      });
    });

  return command;
}
