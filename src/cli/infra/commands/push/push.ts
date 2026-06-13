import { Command } from 'commander';
import { CredentialsProvider, FileWorkspaceConfigRepo } from '@walde.ai/sdk';
import { CommandPush } from '@/cli/domain/interactors/command-push';
import { ResolveTarget, IProjectRepository } from '@/cli/domain/interactors/resolve-target';
import { PushPresenterV1 } from '@/cli/infra/presenters/push-presenter-v1';
import { Runtime } from '@/cli/infra/runtime';
import { UserError } from '@/cli/domain/exceptions';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';

export type PushCommandDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  projectRepository: IProjectRepository;
};

/**
 * Creates the unified push command
 */
export function createPushCommand(deps: PushCommandDependencies): Command {
  const command = new Command('push');

  command
    .description('Build and deploy UI, content, and assets to a site')
    .option('--target <stageName>', 'Project stage to deploy to (default: prod)')
    .option('--site-id <siteId>', 'Site identifier (overrides project stage resolution)')
    .option('--no-cache-invalidation', 'Skip automatic CloudFront cache invalidation')
    .action(async (options: { target?: string; siteId?: string; cacheInvalidation?: boolean }) => {
      await executePush(deps, options);
    });

  return command;
}

async function executePush(
  deps: PushCommandDependencies,
  options: { target?: string; siteId?: string; cacheInvalidation?: boolean }
): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    const workspaceConfigRepo = new FileWorkspaceConfigRepo();
    const workspaceResult = await workspaceConfigRepo.findWorkspaceWithRoot();

    if (!workspaceResult) {
      throw new UserError('No workspace detected. Run "walde init" to initialize a workspace.');
    }

    const { config: workspaceConfig, rootPath } = workspaceResult;
    const resolveTarget = new ResolveTarget(deps.projectRepository);
    const presenter = new PushPresenterV1();

    const commandPush = new CommandPush(
      resolveTarget,
      presenter,
      deps.credentialsProvider,
      deps.configLoader
    );

    await commandPush.execute(workspaceConfig, rootPath, {
      targetOption: options.target,
      siteIdOption: options.siteId,
      noCacheInvalidation: options.cacheInvalidation === false
    });
  });
}
