import { Command } from 'commander';
import { CredentialsProvider, FileWorkspaceConfigRepo } from '@walde.ai/sdk';
import { CommandUiPush } from '@/cli/domain/interactors/command-ui-push';
import { ResolveTarget, IProjectRepository } from '@/cli/domain/interactors/resolve-target';
import { Runtime } from '@/cli/infra/runtime';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IUiPresenter } from '@/cli/domain/ports/presenters/i-ui-presenter';

export type UiPushDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IUiPresenter;
  projectRepository: IProjectRepository;
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
    .option('--target <stageName>', 'Project stage to deploy to (default: prod)')
    .option('--no-cache-invalidation', 'Skip automatic CloudFront cache invalidation after upload')
    .action(async (options: { path?: string; siteId?: string; target?: string; cacheInvalidation?: boolean }) => {
      await executeUiPush(deps, {
        path: options.path,
        siteId: options.siteId,
        target: options.target,
        noCacheInvalidation: options.cacheInvalidation === false
      });
    });

  return command;
}

async function executeUiPush(deps: UiPushDependencies, options: { path?: string; siteId?: string; target?: string; noCacheInvalidation?: boolean }): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    const workspaceConfigRepo = new FileWorkspaceConfigRepo();
    const resolveTarget = new ResolveTarget(deps.projectRepository);

    const commandUiPush = new CommandUiPush(
      deps.credentialsProvider,
      deps.presenter,
      workspaceConfigRepo,
      resolveTarget,
      deps.configLoader
    );

    await commandUiPush.execute({
      path: options.path,
      siteId: options.siteId,
      target: options.target,
      noCacheInvalidation: options.noCacheInvalidation
    });
  });
}
