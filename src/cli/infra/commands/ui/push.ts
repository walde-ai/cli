import { Command } from 'commander';
import { CredentialsProvider } from '@walde.ai/sdk';
import { CommandUiPush } from '@/cli/domain/interactors/command-ui-push';
import { FileWorkspaceConfigRepo } from '@walde.ai/sdk';
import { ResolveSiteId } from '@/cli/domain/interactors/resolve-site-id';
import { Runtime } from '@/cli/infra/runtime';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IUiPresenter } from '@/cli/domain/ports/presenters/i-ui-presenter';
import { applyWorkspaceStage } from '../common-options';

export type UiPushDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IUiPresenter;
};

/**
 * Creates the UI push command
 */
export function createUiPushCommand(deps: UiPushDependencies): Command {
  const command = new Command('push');

  command
    .description('Push UI files to S3')
    .option('--path <uiPath>', 'Path to the UI directory')
    .option('--site-id <siteId>', 'Site identifier')
    .option('--no-cache-invalidation', 'Skip automatic CloudFront cache invalidation after upload')
    .action(async (options: { path?: string; siteId?: string; cacheInvalidation?: boolean }) => {
      await executeUiPush(deps, {
        path: options.path,
        siteId: options.siteId,
        noCacheInvalidation: options.cacheInvalidation === false
      });
    });

  return command;
}

/**
 * Execute the UI push command
 */
async function executeUiPush(deps: UiPushDependencies, options: { path?: string; siteId?: string; noCacheInvalidation?: boolean }): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    // Create remaining dependencies
    const workspaceConfigRepo = new FileWorkspaceConfigRepo();
    const workspaceConfig = await workspaceConfigRepo.findWorkspace();
    applyWorkspaceStage(workspaceConfig?.stage);

    const resolveSiteId = new ResolveSiteId();

    // Create and execute command interactor
    const commandUiPush = new CommandUiPush(
      deps.credentialsProvider,
      deps.presenter,
      workspaceConfigRepo,
      resolveSiteId,
      deps.configLoader
    );

    await commandUiPush.execute(options);
  });
}
