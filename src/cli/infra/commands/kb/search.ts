import { Command } from 'commander';
import { Runtime } from '@/cli/infra/runtime';
import { CredentialsProvider } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IKnowledgeBasePresenter } from '@/cli/domain/ports/presenters/i-knowledge-base-presenter';
import { CommandKbSearch } from '@/cli/domain/interactors/kb/command-kb-search';

export type KbSearchDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IKnowledgeBasePresenter;
};

export function createKbSearchCommand(deps: KbSearchDependencies): Command {
  const command = new Command('search');

  command
    .description("Search the active project's knowledge base")
    .argument('<query>', 'Plain-language description of what you are looking for')
    .option('--project <projectId>', 'Project ID (defaults to the active workspace project)')
    .option('--limit <n>', 'Maximum number of matches to return', (value) => parseInt(value, 10))
    .action(async (query: string, options) => {
      const runtime = new Runtime();
      await runtime.run(async () => {
        const interactor = new CommandKbSearch(
          deps.credentialsProvider,
          deps.presenter,
          deps.configLoader
        );
        await interactor.execute({
          query,
          projectId: options.project,
          limit: options.limit,
        });
      });
    });

  return command;
}
