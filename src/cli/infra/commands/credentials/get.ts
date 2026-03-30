import { Command } from 'commander';
import { CredentialsProvider } from '@walde.ai/sdk';
import { CommandGetCredentials } from '@/cli/domain/interactors/command-get-credentials';
import { CredentialParser } from '@/cli/domain/ports/out/credential-parser';
import { ICredentialsPresenterV1 } from '@/cli/domain/ports/presenters/i-credentials-presenter-v1';
import { Runtime } from '@/cli/infra/runtime';

export type CredentialsGetDependencies = {
  credentialsProvider: CredentialsProvider;
  credentialParser: CredentialParser;
  presenter: ICredentialsPresenterV1;
};

/**
 * Creates the credentials get command
 */
export function createGetCommand(deps: CredentialsGetDependencies): Command {
  const command = new Command('get');
  
  command
    .description('Display current credentials information')
    .action(async () => {
      await executeGetCredentials(deps);
    });

  return command;
}

/**
 * Execute the get credentials command
 */
async function executeGetCredentials(deps: CredentialsGetDependencies): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    const interactor = new CommandGetCredentials(
      deps.credentialsProvider,
      deps.credentialParser,
      deps.presenter
    );

    await interactor.execute();
  });
}
