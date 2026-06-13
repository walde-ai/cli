import { Command } from 'commander';

import { Runtime } from '@/cli/infra/runtime';
import { CredentialsProvider } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IProjectPresenter } from '@/cli/domain/ports/presenters/i-project-presenter';
import { CommandCreateProject } from '@/cli/domain/interactors/command-create-project';

export type ProjectCreateDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IProjectPresenter;
};

/**
 * Creates the `project create` subcommand.
 */
export function createProjectCreateCommand(deps: ProjectCreateDependencies): Command {
  const command = new Command('create');

  command
    .description('Create a new Walde project')
    .option('--name <name>', 'Project name')
    .option('--site-id <siteId>', 'Existing site ID to use for the prod stage')
    .option('--create-site <name>', 'Create a new site with the given name to use for the prod stage')
    .option('--region <region>', 'AWS region for new site (used with --create-site)')
    .action(async (options) => {
      const runtime = new Runtime();
      await runtime.run(async () => {
        const interactor = new CommandCreateProject(
          deps.credentialsProvider,
          deps.presenter,
          deps.configLoader
        );
        await interactor.execute({
          name: options.name,
          siteId: options.siteId,
          createSiteName: options.createSite,
          createSiteRegion: options.region,
        });
      });
    });

  return command;
}
