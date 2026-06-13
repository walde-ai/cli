import { Command } from 'commander';
import { Runtime } from '@/cli/infra/runtime';
import { CredentialsProvider } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IBriefPresenter } from '@/cli/domain/ports/presenters/i-brief-presenter';
import { CommandBriefCreate } from '@/cli/domain/interactors/brief/command-brief-create';

export type BriefCreateDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IBriefPresenter;
};

export function createBriefCreateCommand(deps: BriefCreateDependencies): Command {
  const command = new Command('create');

  command
    .description('Create a new brief')
    .option('--project <projectId>', 'Project ID (defaults to walde.json if in workspace)')
    .option('--title <title>', 'Brief title')
    .option('--intent <content>', 'Intent section content')
    .option('--author <name>', 'Author name (defaults to "user")')
    .action(async (options) => {
      const runtime = new Runtime();
      await runtime.run(async () => {
        const interactor = new CommandBriefCreate(
          deps.credentialsProvider,
          deps.presenter,
          deps.configLoader
        );
        await interactor.execute({
          projectId: options.project,
          title: options.title,
          intent: options.intent,
          author: options.author,
        });
      });
    });

  return command;
}
