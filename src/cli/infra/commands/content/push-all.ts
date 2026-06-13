import { Command } from 'commander';
import { CredentialsProvider, FileWorkspaceConfigRepo } from '@walde.ai/sdk';
import { CommandPushAll } from '@/cli/domain/interactors/command-push-all';
import { ResolveTarget, IProjectRepository } from '@/cli/domain/interactors/resolve-target';
import { Runtime } from '@/cli/infra/runtime';
import { UserError } from '@/cli/domain/exceptions';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IContentPresenter } from '@/cli/domain/ports/presenters/i-content-presenter';

export type ContentPushAllDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IContentPresenter;
  projectRepository: IProjectRepository;
};

export function createPushAllCommand(deps: ContentPushAllDependencies): Command {
  const command = new Command('push-all');
  
  command
    .description('Push all content files in the workspace')
    .argument('[folder]', 'Content folder path (defaults to workspace content path)')
    .option('--site-id <siteId>', 'Site identifier (overrides workspace config)')
    .option('--target <stageName>', 'Project stage to deploy to (default: prod)')
    .option('--no-cache-invalidation', 'Skip automatic CloudFront cache invalidation after push')
    .action(async (folder?: string, options: { siteId?: string; target?: string; cacheInvalidation?: boolean } = {}) => {
      await executeContentPushAll(deps, folder, {
        siteId: options.siteId,
        target: options.target,
        noCacheInvalidation: options.cacheInvalidation === false
      });
    });

  return command;
}

async function executeContentPushAll(deps: ContentPushAllDependencies, folder?: string, options: { siteId?: string; target?: string; noCacheInvalidation?: boolean } = {}): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    const workspaceConfigRepo = new FileWorkspaceConfigRepo();
    const resolveTarget = new ResolveTarget(deps.projectRepository);
    let workspaceConfig;

    if (!options.siteId || !folder) {
      workspaceConfig = await workspaceConfigRepo.findWorkspace();
      if (!workspaceConfig && !options.siteId) {
        throw new UserError('No workspace detected and no --site-id provided. Either run from a workspace directory or specify --site-id option.');
      }
    }

    const { siteId } = await resolveTarget.execute({
      siteIdOption: options.siteId,
      targetOption: options.target,
      workspaceConfig: workspaceConfig ?? undefined
    });
    
    let contentPath: string;
    if (folder) {
      contentPath = folder;
    } else {
      if (!workspaceConfig) {
        throw new UserError('Content folder path is required when using --site-id without a workspace');
      }
      contentPath = workspaceConfig.content.contentPath;
    }
    
    const commandPushAll = new CommandPushAll(deps.credentialsProvider, deps.presenter, deps.configLoader);
    await commandPushAll.execute(siteId, contentPath, options.noCacheInvalidation);
  });
}
