import { Command } from 'commander';
import { Runtime } from '@/cli/infra/runtime';
import { CredentialsProvider } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IBriefPresenter } from '@/cli/domain/ports/presenters/i-brief-presenter';
import { CommandBriefList } from '@/cli/domain/interactors/brief/command-brief-list';

export type BriefListDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: IBriefPresenter;
};

export function createBriefListCommand(deps: BriefListDependencies): Command {
  const command = new Command('list');

  command
    .description('List all briefs')
    .option('--project <projectId>', 'Filter by project ID')
    .action(async (options) => {
      const runtime = new Runtime();
      await runtime.run(async () => {
        const interactor = new CommandBriefList(
          deps.credentialsProvider,
          deps.presenter,
          deps.configLoader
        );
        await interactor.execute({
          projectId: options.project,
        });
      });
    });

  return command;
}
