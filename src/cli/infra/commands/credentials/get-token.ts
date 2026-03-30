import { Command } from 'commander';
import { CredentialsProvider } from '@walde.ai/sdk';
import { CommandGetToken } from '@/cli/domain/interactors/command-get-token';
import { Runtime } from '@/cli/infra/runtime';

export type CredentialsGetTokenDependencies = {
  credentialsProvider: CredentialsProvider;
};

/**
 * Creates the credentials get-token command
 */
export function createGetTokenCommand(deps: CredentialsGetTokenDependencies): Command {
  const command = new Command('get-token');

  command
    .description('Get ID token')
    .action(async () => {
      await executeGetToken(deps);
    });

  return command;
}

/**
 * Execute the get token command
 */
async function executeGetToken(deps: CredentialsGetTokenDependencies): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    const interactor = new CommandGetToken(deps.credentialsProvider);
    await interactor.execute();
  });
}
