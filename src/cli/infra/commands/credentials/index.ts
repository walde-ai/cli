import { Command } from 'commander';
import { createGetCommand, CredentialsGetDependencies } from './get';
import { createRefreshCommand, CredentialsRefreshDependencies } from './refresh';
import { createGetTokenCommand, CredentialsGetTokenDependencies } from './get-token';
import { withCommonOptions } from '../common-options';

export type CredentialsCommandGroupDependencies = {
  get: CredentialsGetDependencies;
  refresh: CredentialsRefreshDependencies;
  getToken: CredentialsGetTokenDependencies;
};

/**
 * Creates the credentials command group
 */
export function createCredentialsCommandGroup(deps: CredentialsCommandGroupDependencies): Command {
  const command = new Command('credentials');
  
  command
    .alias('credential')
    .description('Manage credentials');

  command.addCommand(withCommonOptions(createGetCommand(deps.get)));
  command.addCommand(withCommonOptions(createRefreshCommand(deps.refresh)));
  command.addCommand(withCommonOptions(createGetTokenCommand(deps.getToken)));

  return command;
}
