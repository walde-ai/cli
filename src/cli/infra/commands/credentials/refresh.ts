import { Command } from 'commander';
import { CredentialsProvider } from '@walde.ai/sdk';
import { CommandRefreshCredentials } from '@/cli/domain/interactors/command-refresh-credentials';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { ICredentialsPresenterV1 } from '@/cli/domain/ports/presenters/i-credentials-presenter-v1';
import { Runtime } from '@/cli/infra/runtime';

export type CredentialsRefreshDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter: ICredentialsPresenterV1;
};

/**
 * Creates the credentials refresh command
 */
export function createRefreshCommand(deps: CredentialsRefreshDependencies): Command {
  const command = new Command('refresh');
  
  command
    .description('Refresh authentication tokens using refresh token')
    .action(async () => {
      await executeRefreshCredentials(deps);
    });

  return command;
}

/**
 * Execute the refresh credentials command
 */
async function executeRefreshCredentials(deps: CredentialsRefreshDependencies): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    // Load configuration to get Cognito client ID
    const config = await deps.configLoader.execute();

    if (!config.settings.clientId) {
      deps.presenter.showRefreshError('Cognito client ID not configured');
      process.exit(1);
    }

    // Execute refresh via Command interactor
    const interactor = new CommandRefreshCredentials(
      deps.credentialsProvider,
      deps.presenter,
      config.settings.clientId,
      config.settings.region,
      config.settings.endpoint
    );

    await interactor.execute();
  });
}
