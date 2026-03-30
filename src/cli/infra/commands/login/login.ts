import { Command } from 'commander';
import { CommandLogin } from '@/cli/domain/interactors/command-login';
import { IAuthPresenter } from '@/cli/domain/ports/presenters/i-auth-presenter';
import { ICredentialsRepoFactory } from '@/cli/domain/ports/in/i-credentials-repo-factory';
import { CognitoAuthProvider } from '@/cli/infra/adapters/out/cognito-auth-provider';
import { ConfigLoaderFactory } from '@/cli/infra/factories/index';
import { Runtime } from '@/cli/infra/runtime';

export type LoginDependencies = {
  configLoaderFactory: { Create: () => any };
  presenter: IAuthPresenter;
  credentialsRepoFactory: ICredentialsRepoFactory;
};

/**
 * Creates the login command
 */
export function createLoginCommand(deps: LoginDependencies): Command {
  const command = new Command('login');
  
  command
    .description('Authenticate with AWS Cognito')
    .option('--user <user>', 'Username for authentication')
    .action(async (options) => {
      await executeLogin(deps, options.user);
    });

  return command;
}

/**
 * Execute the login command
 */
async function executeLogin(deps: LoginDependencies, username?: string): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    const configLoader = deps.configLoaderFactory.Create();
    const config = await configLoader.execute();
    const authProvider = new CognitoAuthProvider(config.settings);
    const credentialsRepo = deps.credentialsRepoFactory.create();
    
    const commandLogin = new CommandLogin(
      authProvider,
      deps.presenter,
      credentialsRepo
    );

    await commandLogin.execute(username);
  });
}
