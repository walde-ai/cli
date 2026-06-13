import { Command } from 'commander';
import { Runtime } from '@/cli/infra/runtime';
import { CredentialsProvider } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IBriefPresenter } from '@/cli/domain/ports/presenters/i-brief-presenter';
import { CommandBriefArchive } from '@/cli/domain/interactors/brief/command-brief-archive';

export type BriefArchiveDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IBriefPresenter;
};

export function createBriefArchiveCommand(deps: BriefArchiveDependencies): Command {
  const command = new Command('archive');

  command
    .description('Archive a brief')
    .argument('<briefId>', 'Brief ID')
    .option('--author <name>', 'Author name (defaults to "user")')
    .action(async (briefId, options) => {
      const runtime = new Runtime();
      await runtime.run(async () => {
        const interactor = new CommandBriefArchive(
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
