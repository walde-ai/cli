import { Command } from 'commander';
import { createPushCommand, ContentPushDependencies } from './push';
import { createListCommand, ContentListDependencies } from './list';
import { withCommonOptions } from '../common-options';

export type ContentCommandGroupDependencies = {
  list: ContentListDependencies;
  push: ContentPushDependencies;
};

/**
 * Creates the content command group
 */
export function createContentCommand(deps: ContentCommandGroupDependencies): Command {
  const command = new Command('content');
  
  command
    .alias('contents')
    .description('Manage content');

  command.addCommand(withCommonOptions(createPushCommand(deps.push)));
  command.addCommand(withCommonOptions(createListCommand(deps.list)));

  return command;
}

/**
 * Creates the content command group
 */
export function createContentCommandGroup(deps: ContentCommandGroupDependencies): Command {
  return createContentCommand(deps);
}
