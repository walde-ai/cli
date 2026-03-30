import { Command } from 'commander';
import { CommandSiteCreate } from '@/cli/domain/interactors/command-site-create';
import { Runtime } from '@/cli/infra/runtime';
import { CredentialsProvider } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { ISitePresenter } from '@/cli/domain/ports/presenters/i-site-presenter';

export type SiteCreateDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: ISitePresenter;
};

/**
 * Creates the site create command
 */
export function createCreateCommand(deps: SiteCreateDependencies): Command {
  const command = new Command('create');
  
  command
    .description('Create a new site')
    .argument('[site-name]', 'Name for the new site')
    .requiredOption('--region <region>', 'AWS region for site resources (e.g., us-east-1)')
    .action(async (siteName: string | undefined, options: { region: string }) => {
      await executeSiteCreate(deps, siteName, options.region);
    });

  return command;
}

async function executeSiteCreate(deps: SiteCreateDependencies, siteName: string | undefined, region: string): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    const commandSiteCreate = new CommandSiteCreate(
      deps.credentialsProvider,
      deps.presenter,
      deps.configLoader
    );

    await commandSiteCreate.execute(siteName, region);
  });
}
