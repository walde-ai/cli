import { Command } from 'commander';
import { CredentialsProvider } from '@walde.ai/sdk';
import { CommandUiInvalidateCache } from '@/cli/domain/interactors/command-ui-invalidate-cache';
import { ResolveTarget, IProjectRepository } from '@/cli/domain/interactors/resolve-target';
import { Runtime } from '@/cli/infra/runtime';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { ICachePresenter } from '@/cli/domain/ports/presenters/i-cache-presenter';

export type UiInvalidateCacheDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: ICachePresenter;
  projectRepository: IProjectRepository;
};

export function createUiInvalidateCacheCommand(deps: UiInvalidateCacheDependencies): Command {
  const command = new Command('invalidate-cache');

  command
    .description('Invalidate the CloudFront cache for the UI distribution')
    .option('--site-id <siteId>', 'Site identifier')
    .option('--target <stageName>', 'Project stage to deploy to (default: prod)')
    .action(async (options: { siteId?: string; target?: string }) => {
      await executeUiInvalidateCache(deps, options);
    });

  return command;
}

async function executeUiInvalidateCache(deps: UiInvalidateCacheDependencies, options: { siteId?: string; target?: string }): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    const resolveTarget = new ResolveTarget(deps.projectRepository);
    const interactor = new CommandUiInvalidateCache(
      deps.credentialsProvider,
      deps.presenter,
      resolveTarget,
      deps.configLoader
    );
    await interactor.execute({ siteId: options.siteId, target: options.target });
  });
}
