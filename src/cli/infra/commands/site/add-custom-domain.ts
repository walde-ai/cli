import { Command } from 'commander';
import { CommandSiteAddCustomDomain } from '@/cli/domain/interactors/command-site-add-custom-domain';
import { Runtime } from '@/cli/infra/runtime';
import { CredentialsProvider } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { ISitePresenter } from '@/cli/domain/ports/presenters/i-site-presenter';
import { resolveSiteFromOptions } from './resolve-site-from-options';

export type SiteAddCustomDomainDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: ISitePresenter;
};

/**
 * Creates the site add-custom-domain command
 */
export function createAddCustomDomainCommand(deps: SiteAddCustomDomainDependencies): Command {
  const command = new Command('add-custom-domain');

  command
    .description('Add a custom domain to a site')
    .option('--name <name>', 'Site name')
    .option('--id <id>', 'Site ID')
    .requiredOption('--domain <domain>', 'Custom domain to add')
    .action(async (options: { name?: string; id?: string; domain: string }) => {
      await executeAddCustomDomain(deps, options);
    });

  return command;
}

async function executeAddCustomDomain(
  deps: SiteAddCustomDomainDependencies,
  options: { name?: string; id?: string; domain: string }
): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    const siteId = await resolveSiteFromOptions(deps, { name: options.name, id: options.id });

    const command = new CommandSiteAddCustomDomain(
      deps.credentialsProvider,
      deps.presenter,
      deps.configLoader
    );

    await command.execute(siteId, options.domain);
  });
}
