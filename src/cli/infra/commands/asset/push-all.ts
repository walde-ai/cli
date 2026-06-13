import { Command } from 'commander';

import { CredentialsProvider, FileWorkspaceConfigRepo } from '@walde.ai/sdk';
import { CommandAssetPushAll } from '@/cli/domain/interactors/command-asset-push-all';
import { ResolveTarget, IProjectRepository } from '@/cli/domain/interactors/resolve-target';
import { Runtime } from '@/cli/infra/runtime';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IAssetPresenter } from '@/cli/domain/ports/presenters/i-asset-presenter';

export type AssetPushAllDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IAssetPresenter;
  projectRepository: IProjectRepository;
};

export function createAssetPushAllCommand(deps: AssetPushAllDependencies): Command {
  const command = new Command('push-all');

  command
    .description('Push all asset files from a folder to S3')
    .option('--path <assetsPath>', 'Path to the assets directory')
    .option('--site-id <siteId>', 'Site identifier')
    .option('--target <stageName>', 'Project stage to deploy to (default: prod)')
    .option('--no-cache-invalidation', 'Skip automatic CloudFront cache invalidation after upload')
    .action(async (options: { path?: string; siteId?: string; target?: string; cacheInvalidation?: boolean }) => {
      await executeAssetPushAll(deps, {
        path: options.path,
        siteId: options.siteId,
        target: options.target,
        noCacheInvalidation: options.cacheInvalidation === false
      });
    });

  return command;
}

async function executeAssetPushAll(deps: AssetPushAllDependencies, options: { path?: string; siteId?: string; target?: string; noCacheInvalidation?: boolean }): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    const workspaceConfigRepo = new FileWorkspaceConfigRepo();
    const resolveTarget = new ResolveTarget(deps.projectRepository);

    const commandAssetPushAll = new CommandAssetPushAll(
      deps.credentialsProvider,
      deps.presenter,
      workspaceConfigRepo,
      resolveTarget,
      deps.configLoader
    );

    await commandAssetPushAll.execute(options);
  });
}
