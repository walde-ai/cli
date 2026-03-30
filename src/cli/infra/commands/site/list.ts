import { Command } from 'commander';
import { CommandSiteList } from '@/cli/domain/interactors/command-site-list';
import { Runtime } from '@/cli/infra/runtime';
import { CredentialsProvider } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { ISitePresenter } from '@/cli/domain/ports/presenters/i-site-presenter';

export type SiteListDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: ISitePresenter;
};

/**
 * Creates the site list command
 */
export function createListCommand(deps: SiteListDependencies): Command {
  const command = new Command('list');
  
  command
    .description('List all sites')
    .action(async () => {
      await executeSiteList(deps);
    });

  return command;
}

/**
 * Execute the site list command
 */
async function executeSiteList(deps: SiteListDependencies): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    const commandSiteList = new CommandSiteList(
      deps.credentialsProvider,
      deps.presenter,
      deps.configLoader
    );

    await commandSiteList.execute();
  });
}
