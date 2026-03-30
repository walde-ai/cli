import { Command } from 'commander';

import { CredentialsProvider } from '@walde.ai/sdk';
import { FileWorkspaceConfigRepo } from '@walde.ai/sdk';
import { CommandAssetPushAll } from '@/cli/domain/interactors/command-asset-push-all';
import { ResolveSiteId } from '@/cli/domain/interactors/resolve-site-id';
import { Runtime } from '@/cli/infra/runtime';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IAssetPresenter } from '@/cli/domain/ports/presenters/i-asset-presenter';

export type AssetPushAllDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IAssetPresenter;
};

/**
 * Creates the asset push-all command
 */
export function createAssetPushAllCommand(deps: AssetPushAllDependencies): Command {
  const command = new Command('push-all');

  command
    .description('Push all asset files from a folder to S3')
    .option('--path <assetsPath>', 'Path to the assets directory')
    .option('--site-id <siteId>', 'Site identifier')
    .option('--no-cache-invalidation', 'Skip automatic CloudFront cache invalidation after upload')
    .action(async (options: { path?: string; siteId?: string; cacheInvalidation?: boolean }) => {
      await executeAssetPushAll(deps, {
        path: options.path,
        siteId: options.siteId,
        noCacheInvalidation: options.cacheInvalidation === false
      });
    });

  return command;
}

async function executeAssetPushAll(deps: AssetPushAllDependencies, options: { path?: string; siteId?: string; noCacheInvalidation?: boolean }): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    const workspaceConfigRepo = new FileWorkspaceConfigRepo();
    const resolveSiteId = new ResolveSiteId();

    const commandAssetPushAll = new CommandAssetPushAll(
      deps.credentialsProvider,
      deps.presenter,
      workspaceConfigRepo,
      resolveSiteId,
      deps.configLoader
    );

    await commandAssetPushAll.execute(options);
  });
}
