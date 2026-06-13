import { Command } from 'commander';
import { CredentialsProvider } from '@walde.ai/sdk';
import { CommandContentList } from '@/cli/domain/interactors/command-content-list';
import { Runtime } from '@/cli/infra/runtime';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IContentPresenter } from '@/cli/domain/ports/presenters/i-content-presenter';

export type ContentListDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IContentPresenter;
};

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

async function executeContentList(deps: ContentListDependencies, options: { siteId?: string }): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    const siteId = options.siteId || '';
    
    const commandContentList = new CommandContentList(siteId, deps.credentialsProvider, deps.presenter, deps.configLoader);
    await commandContentList.execute();
  });
}
