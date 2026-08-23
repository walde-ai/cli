import { Command } from 'commander';
import { Runtime } from '@/cli/infra/runtime';
import { CredentialsProvider } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IKnowledgeBasePresenter } from '@/cli/domain/ports/presenters/i-knowledge-base-presenter';
import { CommandKbFetch } from '@/cli/domain/interactors/kb/command-kb-fetch';

export type KbFetchDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IKnowledgeBasePresenter;
};

export function createKbFetchCommand(deps: KbFetchDependencies): Command {
  const command = new Command('fetch');

  command
    .description("Fetch a whole object from the active project's knowledge base by its object id")
    .argument('<id>', 'The object identifier, as returned by `walde kb search`')
    .option('--version <version>', 'Optional specific version of the object; omit to fetch the latest')
    .option('--project <projectId>', 'Project ID (defaults to the active workspace project)')
    .action(async (id: string, options) => {
      const runtime = new Runtime();
      await runtime.run(async () => {
        const interactor = new CommandKbFetch(
          deps.credentialsProvider,
          deps.presenter,
          deps.configLoader
        );
        await interactor.execute({
          id,
          ...(typeof options.version === 'string' ? { version: options.version } : {}),
          ...(typeof options.project === 'string' ? { projectId: options.project } : {}),
        });
      });
    });

  return command;
}
