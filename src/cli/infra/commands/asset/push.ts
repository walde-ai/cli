import { Command } from 'commander';

import { CredentialsProvider } from '@walde.ai/sdk';
import { FileWorkspaceConfigRepo } from '@walde.ai/sdk';
import { CommandAssetPush } from '@/cli/domain/interactors/command-asset-push';
import { CommandAssetPushAll } from '@/cli/domain/interactors/command-asset-push-all';
import { ResolveSiteId } from '@/cli/domain/interactors/resolve-site-id';
import { Runtime } from '@/cli/infra/runtime';
import { UserError } from '@/cli/domain/exceptions';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IAssetPresenter } from '@/cli/domain/ports/presenters/i-asset-presenter';
import { applyWorkspaceStage } from '../common-options';

export type AssetPushDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IAssetPresenter;
};

/**
 * Creates the asset push command
 */
export function createAssetPushCommand(deps: AssetPushDependencies): Command {
  const command = new Command('push');

  command
    .description('Push asset file(s) to S3')
    .argument('[file]', 'Path to the asset file')
    .option('--all', 'Push all asset files from a folder')
    .option('--key <key>', 'Asset key (S3 path under assets/ prefix)')
    .option('--path <assetsPath>', 'Path to the assets directory (used with --all)')
    .option('--site-id <siteId>', 'Site identifier')
    .option('--no-cache-invalidation', 'Skip automatic CloudFront cache invalidation after upload')
    .action(async (file: string | undefined, options: { all?: boolean; key?: string; path?: string; siteId?: string; cacheInvalidation?: boolean }) => {
      if (options.all) {
        await executeAssetPushAll(deps, {
          path: options.path,
          siteId: options.siteId,
          noCacheInvalidation: options.cacheInvalidation === false
        });
      } else if (file) {
        await executeAssetPush(deps, file, {
          key: options.key,
          siteId: options.siteId,
          noCacheInvalidation: options.cacheInvalidation === false
        });
      } else {
        throw new UserError('Please provide a file path (e.g., asset push <file>) or use --all to push all assets (e.g., asset push --all).');
      }
    });

  return command;
}

async function executeAssetPush(deps: AssetPushDependencies, file: string, options: { key?: string; siteId?: string; noCacheInvalidation?: boolean }): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    const workspaceConfigRepo = new FileWorkspaceConfigRepo();
    const workspaceConfig = await workspaceConfigRepo.findWorkspace();
    applyWorkspaceStage(workspaceConfig?.stage);

    const resolveSiteId = new ResolveSiteId();

    const commandAssetPush = new CommandAssetPush(
      deps.credentialsProvider,
      deps.presenter,
      workspaceConfigRepo,
      resolveSiteId,
      deps.configLoader
    );

    await commandAssetPush.execute({ filePath: file, key: options.key, siteId: options.siteId, noCacheInvalidation: options.noCacheInvalidation });
  });
}

async function executeAssetPushAll(deps: AssetPushDependencies, options: { path?: string; siteId?: string; noCacheInvalidation?: boolean }): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    const workspaceConfigRepo = new FileWorkspaceConfigRepo();
    const workspaceConfig = await workspaceConfigRepo.findWorkspace();
    applyWorkspaceStage(workspaceConfig?.stage);

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
