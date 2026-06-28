import { Command } from 'commander';
import { CommandSiteDelete } from '@/cli/domain/interactors/command-site-delete';
import { Runtime } from '@/cli/infra/runtime';
import { CredentialsProvider } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { ISitePresenter } from '@/cli/domain/ports/presenters/i-site-presenter';
import { resolveSiteFromOptions } from './resolve-site-from-options';

export type SiteDeleteDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: ISitePresenter;
};

/**
 * Creates the site delete command
 */
export function createDeleteCommand(deps: SiteDeleteDependencies): Command {
  const command = new Command('delete');

  command
    .description('Delete a site')
    .option('--name <name>', 'Site name')
    .option('--id <id>', 'Site ID')
    .option('--confirm', 'Skip confirmation prompt')
    .option('--wait <timeout-seconds>', 'Wait for completion with timeout in seconds')
    .action(async (options: { name?: string; id?: string; confirm?: boolean; wait?: string }) => {
      await executeSiteDelete(deps, options);
    });

  return command;
}

async function executeSiteDelete(
  deps: SiteDeleteDependencies,
  options: { name?: string; id?: string; confirm?: boolean; wait?: string }
): Promise<void> {
  const waitSeconds = options.wait === undefined ? undefined : Number(options.wait);
  if (waitSeconds !== undefined && (!Number.isFinite(waitSeconds) || waitSeconds <= 0)) {
    throw new Error('--wait must be a positive number of seconds');
  }
  const runtime = new Runtime();
  await runtime.run(async () => {
    const siteId = await resolveSiteFromOptions(deps, { name: options.name, id: options.id });

    const commandSiteDelete = new CommandSiteDelete(
      deps.credentialsProvider,
      deps.presenter,
      deps.configLoader
    );

    await commandSiteDelete.execute(siteId, { confirm: options.confirm, waitSeconds });
  });
}
