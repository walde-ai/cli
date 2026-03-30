import { Command } from 'commander';
import { CredentialsProvider } from '@walde.ai/sdk';
import { WorkspaceFactory } from '@/cli/infra/factories/workspace-factory';
import { CommandPushAll } from '@/cli/domain/interactors/command-push-all';
import { Runtime } from '@/cli/infra/runtime';
import { UserError } from '@/cli/domain/exceptions';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IContentPresenter } from '@/cli/domain/ports/presenters/i-content-presenter';

export type ContentPushAllDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IContentPresenter;
};

/**
 * Creates the content push-all command
 */
export function createPushAllCommand(deps: ContentPushAllDependencies): Command {
  const command = new Command('push-all');
  
  command
    .description('Push all content files in the workspace')
    .argument('[folder]', 'Content folder path (defaults to workspace content path)')
    .option('--site-id <siteId>', 'Site identifier (overrides workspace config)')
    .option('--no-cache-invalidation', 'Skip automatic CloudFront cache invalidation after push')
    .action(async (folder?: string, options: { siteId?: string; cacheInvalidation?: boolean } = {}) => {
      await executeContentPushAll(deps, folder, {
        siteId: options.siteId,
        noCacheInvalidation: options.cacheInvalidation === false
      });
    });

  return command;
}

/**
 * Execute the content push-all command
 */
async function executeContentPushAll(deps: ContentPushAllDependencies, folder?: string, options: { siteId?: string; noCacheInvalidation?: boolean } = {}): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    // Detect workspace configuration
    const detectWorkspace = WorkspaceFactory.CreateDetectWorkspace();
    const workspaceConfig = await detectWorkspace.execute();
    
    // Resolve siteId from options or workspace (required for push command)
    const resolveSiteId = WorkspaceFactory.CreateResolveSiteId();
    const siteId = resolveSiteId.execute(options.siteId, workspaceConfig, true);
    
    if (!siteId) {
      throw new UserError('Site ID is required for push command');
    }
    
    // Determine content path: use provided folder or workspace config
    let contentPath: string;
    if (folder) {
      contentPath = folder;
    } else {
      if (!workspaceConfig?.paths?.content) {
        throw new Error('Workspace configuration missing content path. Please reinitialize workspace or provide folder argument.');
      }
      contentPath = workspaceConfig.paths.content;
    }
    
    const commandPushAll = new CommandPushAll(deps.credentialsProvider, deps.presenter, deps.configLoader);
    await commandPushAll.execute(siteId, contentPath, options.noCacheInvalidation);
  });
}
