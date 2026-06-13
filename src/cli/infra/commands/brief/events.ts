import { Command } from 'commander';
import { Runtime } from '@/cli/infra/runtime';
import { CredentialsProvider } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IBriefPresenter } from '@/cli/domain/ports/presenters/i-brief-presenter';
import { CommandBriefEvents } from '@/cli/domain/interactors/brief/command-brief-events';

export type BriefEventsDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IBriefPresenter;
};

export function createBriefEventsCommand(deps: BriefEventsDependencies): Command {
  const command = new Command('events');

  command
    .description('Show event log for a brief')
    .argument('<briefId>', 'Brief ID')
    .action(async (briefId) => {
      const runtime = new Runtime();
      await runtime.run(async () => {
        const interactor = new CommandBriefEvents(
          deps.credentialsProvider,
          deps.presenter,
          deps.configLoader
        );
        await interactor.execute({ briefId });
      });
    });

  return command;
}
