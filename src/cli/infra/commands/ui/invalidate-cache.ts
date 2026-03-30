import { Command } from 'commander';
import { CredentialsProvider } from '@walde.ai/sdk';
import { CommandUiInvalidateCache } from '@/cli/domain/interactors/command-ui-invalidate-cache';
import { ResolveSiteId } from '@/cli/domain/interactors/resolve-site-id';
import { Runtime } from '@/cli/infra/runtime';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { ICachePresenter } from '@/cli/domain/ports/presenters/i-cache-presenter';
import { applyWorkspaceStage } from '../common-options';
import { FileWorkspaceConfigRepo } from '@walde.ai/sdk';

export type UiInvalidateCacheDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: ICachePresenter;
};

/**
 * Creates the UI invalidate-cache command.
 */
export function createUiInvalidateCacheCommand(deps: UiInvalidateCacheDependencies): Command {
  const command = new Command('invalidate-cache');

  command
    .description('Invalidate the CloudFront cache for the UI distribution')
    .option('--site-id <siteId>', 'Site identifier')
    .action(async (options: { siteId?: string }) => {
      await executeUiInvalidateCache(deps, options);
    });

  return command;
}

async function executeUiInvalidateCache(deps: UiInvalidateCacheDependencies, options: { siteId?: string }): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    const workspaceConfigRepo = new FileWorkspaceConfigRepo();
    const workspaceConfig = await workspaceConfigRepo.findWorkspace();
    applyWorkspaceStage(workspaceConfig?.stage);

    const resolveSiteId = new ResolveSiteId();
    const interactor = new CommandUiInvalidateCache(
      deps.credentialsProvider,
      deps.presenter,
      resolveSiteId,
      deps.configLoader
    );
    await interactor.execute(options);
  });
}
