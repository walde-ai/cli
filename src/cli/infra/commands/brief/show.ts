import { Command } from 'commander';
import { Runtime } from '@/cli/infra/runtime';
import { CredentialsProvider } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IBriefPresenter } from '@/cli/domain/ports/presenters/i-brief-presenter';
import { CommandBriefShow } from '@/cli/domain/interactors/brief/command-brief-show';

export type BriefShowDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IBriefPresenter;
};

export function createBriefShowCommand(deps: BriefShowDependencies): Command {
  const command = new Command('show');

  command
    .description('Show a specific brief')
    .argument('<briefId>', 'Brief ID')
    .action(async (briefId) => {
      const runtime = new Runtime();
      await runtime.run(async () => {
        const interactor = new CommandBriefShow(
          deps.credentialsProvider,
          deps.presenter,
          deps.configLoader
        );
        await interactor.execute({ briefId });
      });
    });

  return command;
}
