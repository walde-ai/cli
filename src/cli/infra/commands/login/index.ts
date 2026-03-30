import { Command } from 'commander';
import { createLoginCommand, LoginDependencies } from './login';

export type LoginCommandGroupDependencies = {
  login: LoginDependencies;
};

/**
 * Creates the login command group
 */
export function createLoginCommandGroup(deps: LoginCommandGroupDependencies): Command {
  return createLoginCommand(deps.login);
}
