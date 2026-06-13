import { Command } from 'commander';

import { withCommonOptions } from '../../common-options';
import { createBriefEventAppendCommand, BriefEventAppendDependencies } from './append';

export type BriefEventCommandGroupDependencies = {
  append: BriefEventAppendDependencies;
};

export function createBriefEventCommandGroup(deps: BriefEventCommandGroupDependencies): Command {
  const command = new Command('event');

  command.description('Sub-commands for managing raw brief events (e.g., `brief event append`)');

  command.addCommand(withCommonOptions(createBriefEventAppendCommand(deps.append)));

  return command;
}
