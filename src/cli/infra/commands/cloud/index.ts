import { Command } from 'commander';

import { withCommonOptions } from '../common-options';
import { createCloudApiCommandGroup, CloudApiCommandGroupDependencies } from './api/index';

export type CloudCommandGroupDependencies = {
  api: CloudApiCommandGroupDependencies;
};

export function createCloudCommandGroup(deps: CloudCommandGroupDependencies): Command {
  const command = new Command('cloud');

  command.description('Manage cloud API deployments');
  command.addCommand(withCommonOptions(createCloudApiCommandGroup(deps.api)));

  return command;
}
