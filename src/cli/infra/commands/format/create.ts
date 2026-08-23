import { Command } from 'commander';
import { Runtime } from '@/cli/infra/runtime';
import { CredentialsProvider } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IFormatPresenter } from '@/cli/domain/ports/presenters/i-format-presenter';
import { CommandFormatCreate } from '@/cli/domain/interactors/format/command-format-create';

export type FormatCreateDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IFormatPresenter;
};

/**
 * Creates the `format create` subcommand.
 */
export function createFormatCreateCommand(deps: FormatCreateDependencies): Command {
  const command = new Command('create');

  command
    .description('Create a custom post format for the project')
    .option('--project <projectId>', 'Project ID (defaults to the active workspace project)')
    .option('--name <name>', 'Format name (otherwise prompted)')
    .option(
      '--field <spec>',
      'Field definition as name:type:default (repeatable; otherwise prompted)',
      (value: string, previous: string[]) => previous.concat([value]),
      [] as string[]
    )
    .action(async (options) => {
      const runtime = new Runtime();
      await runtime.run(async () => {
        const interactor = new CommandFormatCreate(
          deps.credentialsProvider,
          deps.presenter,
          deps.configLoader
        );
        await interactor.execute({
          projectId: options.project,
          name: options.name,
          fields: options.field,
        });
      });
    });

  return command;
}
