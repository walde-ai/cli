import { Command } from 'commander';

import { withCommonOptions } from '../common-options';
import { createDevStartCommand, DevStartDependencies, executeDevStart } from './start';

export type DevCommandGroupDependencies = {
  start: DevStartDependencies;
};

export function createDevCommandGroup(deps: DevCommandGroupDependencies): Command {
  const command = new Command('dev');

  command
    .description('Run local development servers')
    .option('--path <path>', 'Project root path (defaults to nearest walde.json from current directory)')
    .action(async (options) => {
      await executeDevStart(deps.start, options.path);
    });

  command.addCommand(withCommonOptions(createDevStartCommand(deps.start)));

  return command;
}
