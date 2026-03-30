import { Command } from 'commander';
import { CredentialsProvider } from '@walde.ai/sdk';
import { WorkspaceFactory } from '@/cli/infra/factories/workspace-factory';
import { CommandContentPush } from '@/cli/domain/interactors/command-content-push';
import { CommandPushAll } from '@/cli/domain/interactors/command-push-all';
import { Runtime } from '@/cli/infra/runtime';
import { UserError } from '@/cli/domain/exceptions';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IContentPresenter } from '@/cli/domain/ports/presenters/i-content-presenter';
import { applyWorkspaceStage } from '../common-options';

export type ContentPushDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IContentPresenter;
};

/**
 * Creates the content push command
 */
export function createPushCommand(deps: ContentPushDependencies): Command {
  const command = new Command('push');
  
  command
    .description('Push content to the API')
    .argument('[filePath]', 'Path to the content file')
    .option('--all [folder]', 'Push all content files in the workspace (optionally from a specific folder)')
    .option('--site-id <siteId>', 'Site identifier (overrides workspace config)')
    .option('--no-cache-invalidation', 'Skip automatic CloudFront cache invalidation after push')
    .action(async (filePath: string | undefined, options: { all?: string | boolean; siteId?: string; cacheInvalidation?: boolean }) => {
      if (options.all !== undefined) {
        const folder = typeof options.all === 'string' ? options.all : undefined;
        await executeContentPushAll(deps, folder, {
          siteId: options.siteId,
          noCacheInvalidation: options.cacheInvalidation === false
        });
      } else if (filePath) {
        await executeContentPush(deps, filePath, {
          siteId: options.siteId,
          noCacheInvalidation: options.cacheInvalidation === false
        });
      } else {
        throw new UserError('Please provide a file path (e.g., content push <file>) or use --all to push all content files (e.g., content push --all).');
      }
    });

  return command;
}

/**
 * Execute the content push command for a single file
 */
async function executeContentPush(deps: ContentPushDependencies, filePath: string, options: { siteId?: string; noCacheInvalidation?: boolean }): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    // Detect workspace configuration
    const detectWorkspace = WorkspaceFactory.CreateDetectWorkspace();
    const workspaceConfig = await detectWorkspace.execute();
    applyWorkspaceStage(workspaceConfig?.stage);
    
    // Resolve siteId from options or workspace (required for push command)
    const resolveSiteId = WorkspaceFactory.CreateResolveSiteId();
    const siteId = resolveSiteId.execute(options.siteId, workspaceConfig, true);
    
    // This should never be undefined since required=true, but TypeScript doesn't know that
    if (!siteId) {
      throw new Error('Site ID is required for push command');
    }
    
    const commandContentPush = new CommandContentPush(deps.credentialsProvider, deps.presenter, deps.configLoader);
    await commandContentPush.execute(siteId, filePath, options.noCacheInvalidation);
  });
}

/**
 * Execute the content push-all command
 */
async function executeContentPushAll(deps: ContentPushDependencies, folder?: string, options: { siteId?: string; noCacheInvalidation?: boolean } = {}): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    // Detect workspace configuration
    const detectWorkspace = WorkspaceFactory.CreateDetectWorkspace();
    const workspaceConfig = await detectWorkspace.execute();
    applyWorkspaceStage(workspaceConfig?.stage);
    
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
