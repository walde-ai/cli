import { Command } from 'commander';
import { CommandSiteAssociateCertificates } from '@/cli/domain/interactors/command-site-associate-certificates';
import { Runtime } from '@/cli/infra/runtime';
import { CredentialsProvider } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { ISitePresenter } from '@/cli/domain/ports/presenters/i-site-presenter';
import { resolveSiteFromOptions } from './resolve-site-from-options';

export type SiteAssociateCertificatesDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: ISitePresenter;
};

/**
 * Creates the site associate-certificates command
 */
export function createAssociateCertificatesCommand(deps: SiteAssociateCertificatesDependencies): Command {
  const command = new Command('associate-certificates');
  
  command
    .description('Associate certificates for a site\'s custom domain')
    .option('--name <name>', 'Site name')
    .option('--id <id>', 'Site ID')
    .action(async (options: { name?: string; id?: string }) => {
      await executeSiteAssociateCertificates(deps, options);
    });

  return command;
}

/**
 * Execute the site associate-certificates command
 */
async function executeSiteAssociateCertificates(deps: SiteAssociateCertificatesDependencies, options: { name?: string; id?: string }): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    const siteId = await resolveSiteFromOptions(deps, { name: options.name, id: options.id });

    const commandSiteAssociateCertificates = new CommandSiteAssociateCertificates(
      deps.credentialsProvider,
      deps.presenter,
      deps.configLoader
    );

    await commandSiteAssociateCertificates.execute(siteId);
  });
}
