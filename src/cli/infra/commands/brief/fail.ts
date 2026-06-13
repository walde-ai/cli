import { Command } from 'commander';
import { Runtime } from '@/cli/infra/runtime';
import { CredentialsProvider } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IBriefPresenter } from '@/cli/domain/ports/presenters/i-brief-presenter';
import { CommandBriefFail } from '@/cli/domain/interactors/brief/command-brief-fail';

export type BriefFailDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IBriefPresenter;
};

export function createBriefFailCommand(deps: BriefFailDependencies): Command {
  const command = new Command('fail');

  command
    .description('Mark brief as failed')
    .argument('<briefId>', 'Brief ID')
    .option('--reason <message>', 'Failure reason (added as comment)')
    .option('--author <name>', 'Author name (defaults to "user")')
    .action(async (briefId, options) => {
      const runtime = new Runtime();
      await runtime.run(async () => {
        const interactor = new CommandBriefFail(
          deps.credentialsProvider,
          deps.presenter,
          deps.configLoader
        );
        await interactor.execute({
          briefId,
          reason: options.reason,
          author: options.author,
        });
      });
    });

  return command;
}
