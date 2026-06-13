import { Command } from 'commander';
import { CredentialsProvider, FileWorkspaceConfigRepo } from '@walde.ai/sdk';
import { CommandContentPush } from '@/cli/domain/interactors/command-content-push';
import { CommandPushAll } from '@/cli/domain/interactors/command-push-all';
import { ResolveTarget, IProjectRepository } from '@/cli/domain/interactors/resolve-target';
import { Runtime } from '@/cli/infra/runtime';
import { UserError } from '@/cli/domain/exceptions';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IContentPresenter } from '@/cli/domain/ports/presenters/i-content-presenter';

export type ContentPushDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IContentPresenter;
  projectRepository: IProjectRepository;
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
    .option('--target <stageName>', 'Project stage to deploy to (default: prod)')
    .option('--no-cache-invalidation', 'Skip automatic CloudFront cache invalidation after push')
    .action(async (filePath: string | undefined, options: { all?: string | boolean; siteId?: string; target?: string; cacheInvalidation?: boolean }) => {
      if (options.all !== undefined) {
        const folder = typeof options.all === 'string' ? options.all : undefined;
        await executeContentPushAll(deps, folder, {
          siteId: options.siteId,
          target: options.target,
          noCacheInvalidation: options.cacheInvalidation === false
        });
      } else if (filePath) {
        await executeContentPush(deps, filePath, {
          siteId: options.siteId,
          target: options.target,
          noCacheInvalidation: options.cacheInvalidation === false
        });
      } else {
        throw new UserError('Please provide a file path (e.g., content push <file>) or use --all to push all content files (e.g., content push --all).');
      }
    });

  return command;
}

async function executeContentPush(deps: ContentPushDependencies, filePath: string, options: { siteId?: string; target?: string; noCacheInvalidation?: boolean }): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    const resolveTarget = new ResolveTarget(deps.projectRepository);
    let workspaceConfig;

    if (!options.siteId) {
      const workspaceConfigRepo = new FileWorkspaceConfigRepo();
      workspaceConfig = await workspaceConfigRepo.findWorkspace();
      if (!workspaceConfig) {
        throw new UserError('No workspace detected and no --site-id provided. Either run from a workspace directory or specify --site-id option.');
      }
    }

    const { siteId } = await resolveTarget.execute({
      siteIdOption: options.siteId,
      targetOption: options.target,
      workspaceConfig: workspaceConfig ?? undefined
    });
    
    const commandContentPush = new CommandContentPush(deps.credentialsProvider, deps.presenter, deps.configLoader);
    await commandContentPush.execute(siteId, filePath, options.noCacheInvalidation);
  });
}

async function executeContentPushAll(deps: ContentPushDependencies, folder?: string, options: { siteId?: string; target?: string; noCacheInvalidation?: boolean } = {}): Promise<void> {
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
