import { Command } from 'commander';
import { CredentialsProvider } from '@walde.ai/sdk';
import { CommandContentInvalidateCache } from '@/cli/domain/interactors/command-content-invalidate-cache';
import { ResolveSiteId } from '@/cli/domain/interactors/resolve-site-id';
import { Runtime } from '@/cli/infra/runtime';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { ICachePresenter } from '@/cli/domain/ports/presenters/i-cache-presenter';
import { applyWorkspaceStage } from '../common-options';
import { FileWorkspaceConfigRepo } from '@walde.ai/sdk';

export type ContentInvalidateCacheDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: ICachePresenter;
};

/**
 * Creates the content invalidate-cache command.
 */
export function createContentInvalidateCacheCommand(deps: ContentInvalidateCacheDependencies): Command {
  const command = new Command('invalidate-cache');

  command
    .description('Invalidate the CloudFront cache for the rendered-content distribution')
    .option('--site-id <siteId>', 'Site identifier')
    .action(async (options: { siteId?: string }) => {
      await executeContentInvalidateCache(deps, options);
    });

  return command;
}

async function executeContentInvalidateCache(deps: ContentInvalidateCacheDependencies, options: { siteId?: string }): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    const workspaceConfigRepo = new FileWorkspaceConfigRepo();
    const workspaceConfig = await workspaceConfigRepo.findWorkspace();
    applyWorkspaceStage(workspaceConfig?.stage);

    const resolveSiteId = new ResolveSiteId();
    const interactor = new CommandContentInvalidateCache(
      deps.credentialsProvider,
      deps.presenter,
      resolveSiteId,
      deps.configLoader
    );
    await interactor.execute(options);
  });
}
