import { Command } from 'commander';
import { CredentialsProvider } from '@walde.ai/sdk';
import { WorkspaceFactory } from '@/cli/infra/factories/workspace-factory';
import { CommandContentList } from '@/cli/domain/interactors/command-content-list';
import { Runtime } from '@/cli/infra/runtime';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IContentPresenter } from '@/cli/domain/ports/presenters/i-content-presenter';
import { applyWorkspaceStage } from '../common-options';

export type ContentListDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IContentPresenter;
};

/**
 * Creates the content list command
 */
export function createListCommand(deps: ContentListDependencies): Command {
  const command = new Command('list');
  
  command
    .description('List all contents (optionally filtered by site)')
    .option('--site-id <siteId>', 'Site identifier to filter by (overrides workspace config)')
    .action(async (options: { siteId?: string }) => {
      await executeContentList(deps, options);
    });

  return command;
}

/**
 * Execute the content list command
 */
async function executeContentList(deps: ContentListDependencies, options: { siteId?: string }): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    // Detect workspace configuration
    const detectWorkspace = WorkspaceFactory.CreateDetectWorkspace();
    const workspaceConfig = await detectWorkspace.execute();
    applyWorkspaceStage(workspaceConfig?.stage);
    
    // Resolve siteId from options or workspace (not required for list command)
    const resolveSiteId = WorkspaceFactory.CreateResolveSiteId();
    const siteId = resolveSiteId.execute(options.siteId, workspaceConfig, false);
    
    const commandContentList = new CommandContentList(siteId || '', deps.credentialsProvider, deps.presenter, deps.configLoader);
    await commandContentList.execute();
  });
}
