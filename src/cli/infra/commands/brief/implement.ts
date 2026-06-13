import { Command } from 'commander';
import { Runtime } from '@/cli/infra/runtime';
import { CredentialsProvider } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IBriefPresenter } from '@/cli/domain/ports/presenters/i-brief-presenter';
import { CommandBriefImplement } from '@/cli/domain/interactors/brief/command-brief-implement';

export type BriefImplementDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IBriefPresenter;
};

export function createBriefImplementCommand(deps: BriefImplementDependencies): Command {
  const command = new Command('implement');

  command
    .description('Mark brief as implementing')
    .argument('<briefId>', 'Brief ID')
    .option('--author <name>', 'Author name (defaults to "user")')
    .action(async (briefId, options) => {
      const runtime = new Runtime();
      await runtime.run(async () => {
        const interactor = new CommandBriefImplement(
          deps.credentialsProvider,
          deps.presenter,
          deps.configLoader
        );
        await interactor.execute({
          briefId,
          author: options.author,
        });
      });
    });

  return command;
}
