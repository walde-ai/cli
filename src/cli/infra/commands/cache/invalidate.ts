import { Command } from 'commander';
import { CredentialsProvider } from '@walde.ai/sdk';
import { CommandCacheInvalidate } from '@/cli/domain/interactors/command-cache-invalidate';
import { ResolveSiteId } from '@/cli/domain/interactors/resolve-site-id';
import { Runtime } from '@/cli/infra/runtime';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { ICachePresenter } from '@/cli/domain/ports/presenters/i-cache-presenter';
import { applyWorkspaceStage } from '../common-options';
import { FileWorkspaceConfigRepo } from '@walde.ai/sdk';

export type CacheInvalidateDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: ICachePresenter;
};

/**
 * Creates the cache invalidate command.
 */
export function createCacheInvalidateCommand(deps: CacheInvalidateDependencies): Command {
  const command = new Command('invalidate');

  command
    .description('Invalidate the CloudFront cache for a site')
    .option('--site-id <siteId>', 'Site identifier')
    .action(async (options: { siteId?: string }) => {
      await executeCacheInvalidate(deps, options);
    });

  return command;
}

async function executeCacheInvalidate(deps: CacheInvalidateDependencies, options: { siteId?: string }): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    const workspaceConfigRepo = new FileWorkspaceConfigRepo();
    const workspaceConfig = await workspaceConfigRepo.findWorkspace();
    applyWorkspaceStage(workspaceConfig?.stage);

    const resolveSiteId = new ResolveSiteId();
    const interactor = new CommandCacheInvalidate(
      deps.credentialsProvider,
      deps.presenter,
      resolveSiteId,
      deps.configLoader
    );
    await interactor.execute(options);
  });
}
