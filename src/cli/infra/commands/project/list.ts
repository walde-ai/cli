import { Command } from 'commander';
import { Runtime } from '@/cli/infra/runtime';
import { CredentialsProvider } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IProjectPresenter } from '@/cli/domain/ports/presenters/i-project-presenter';
import { CommandProjectList } from '@/cli/domain/interactors/command-project-list';

export type ProjectListDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IProjectPresenter;
};

/**
 * Creates the `project list` subcommand.
 */
export function createProjectListCommand(deps: ProjectListDependencies): Command {
  const command = new Command('list');

  command
    .description('List all projects in the tenant')
    .action(async () => {
      const runtime = new Runtime();
      await runtime.run(async () => {
        const interactor = new CommandProjectList(
          deps.credentialsProvider,
          deps.presenter,
          deps.configLoader
        );
        await interactor.execute();
      });
    });

  return command;
}
