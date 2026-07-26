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
    .description("Fetch a whole object from the active project's knowledge base")
    .argument('<path>', 'The S3 URI path of the object, as returned by `walde kb search`')
    .option('--project <projectId>', 'Project ID (defaults to the active workspace project)')
    .action(async (path: string, options) => {
      const runtime = new Runtime();
      await runtime.run(async () => {
        const interactor = new CommandKbFetch(
          deps.credentialsProvider,
          deps.presenter,
          deps.configLoader
        );
        await interactor.execute({
          path,
          projectId: options.project,
        });
      });
    });

  return command;
}
