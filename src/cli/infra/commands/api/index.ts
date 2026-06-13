import { Command } from 'commander';
import { withCommonOptions } from '../common-options';
import { createApiCreateCommand, ApiCreateDependencies } from './create';

export type ApiCommandGroupDependencies = {
  create: ApiCreateDependencies;
};

export function createApiCommandGroup(deps: ApiCommandGroupDependencies): Command {
  const command = new Command('api');

  command.description('Manage cloud API endpoints');

  command.addCommand(withCommonOptions(createApiCreateCommand(deps.create)));

  return command;
}
