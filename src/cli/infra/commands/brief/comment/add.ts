import { Command } from 'commander';
import { Runtime } from '@/cli/infra/runtime';
import { CredentialsProvider } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IBriefPresenter } from '@/cli/domain/ports/presenters/i-brief-presenter';
import { CommandBriefCommentAdd } from '@/cli/domain/interactors/brief/command-brief-comment-add';

export type BriefCommentAddDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IBriefPresenter;
};

export function createBriefCommentAddCommand(deps: BriefCommentAddDependencies): Command {
  const command = new Command('add');

  command
    .description('Add a comment to a brief')
    .argument('<briefId>', 'Brief ID')
    .argument('<content>', 'Comment content')
    .option('--author <name>', 'Author name (defaults to "user")')
    .action(async (briefId, content, options) => {
      const runtime = new Runtime();
      await runtime.run(async () => {
        const interactor = new CommandBriefCommentAdd(
          deps.credentialsProvider,
          deps.presenter,
          deps.configLoader
        );
        await interactor.execute({
          briefId,
          content,
          author: options.author,
        });
      });
    });

  return command;
}
