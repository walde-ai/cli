import { Command } from 'commander';

import { Runtime } from '@/cli/infra/runtime';
import { CredentialsProvider } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IProjectPresenter } from '@/cli/domain/ports/presenters/i-project-presenter';
import { CommandProjectDelete } from '@/cli/domain/interactors/command-project-delete';

export type ProjectDeleteDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IProjectPresenter;
};

/**
 * Creates the `project delete <project-id>` subcommand.
 */
export function createProjectDeleteCommand(deps: ProjectDeleteDependencies): Command {
  const command = new Command('delete');

  command
    .description('Delete a project and all its associated resources')
    .argument('<project-id>', 'Project ID to delete')
    .option('--confirm', 'Skip the interactive confirmation prompt')
    .action(async (projectId: string, options: { confirm?: boolean }) => {
      const runtime = new Runtime();
      await runtime.run(async () => {
        const interactor = new CommandProjectDelete(
          deps.credentialsProvider,
          deps.presenter,
          deps.configLoader
        );
        await interactor.execute(projectId, { confirm: options.confirm });
      });
    });

  return command;
}
