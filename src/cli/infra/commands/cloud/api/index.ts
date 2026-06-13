import { Command } from 'commander';

import { withCommonOptions } from '../../common-options';
import { createCloudApiPushCommand, CloudApiPushDependencies } from './push';

export type CloudApiCommandGroupDependencies = {
  push: CloudApiPushDependencies;
};

export function createCloudApiCommandGroup(deps: CloudApiCommandGroupDependencies): Command {
  const command = new Command('api');

  command.description('Cloud API deployment commands');
  command.addCommand(withCommonOptions(createCloudApiPushCommand(deps.push)));

  return command;
}
