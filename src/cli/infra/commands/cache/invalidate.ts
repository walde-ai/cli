import { Command } from 'commander';
import { CredentialsProvider } from '@walde.ai/sdk';
import { CommandCacheInvalidate } from '@/cli/domain/interactors/command-cache-invalidate';
import { ResolveTarget, IProjectRepository } from '@/cli/domain/interactors/resolve-target';
import { Runtime } from '@/cli/infra/runtime';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { ICachePresenter } from '@/cli/domain/ports/presenters/i-cache-presenter';

export type CacheInvalidateDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: ICachePresenter;
  projectRepository: IProjectRepository;
};

/**
 * Creates the cache invalidate command.
 */
export function createCacheInvalidateCommand(deps: CacheInvalidateDependencies): Command {
  const command = new Command('invalidate');

  command
    .description('Invalidate the CloudFront cache for a site')
    .option('--site-id <siteId>', 'Site identifier')
    .option('--target <stageName>', 'Project stage to deploy to (default: prod)')
    .action(async (options: { siteId?: string; target?: string }) => {
      await executeCacheInvalidate(deps, options);
    });

  return command;
}

async function executeCacheInvalidate(deps: CacheInvalidateDependencies, options: { siteId?: string; target?: string }): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    const resolveTarget = new ResolveTarget(deps.projectRepository);
    const interactor = new CommandCacheInvalidate(
      deps.credentialsProvider,
      deps.presenter,
      resolveTarget,
      deps.configLoader
    );
    await interactor.execute({ siteId: options.siteId, target: options.target });
  });
}
