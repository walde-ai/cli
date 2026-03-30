import { Command } from 'commander';
import { createUiPushCommand, UiPushDependencies } from './push';
import { withCommonOptions } from '../common-options';

export type UiCommandGroupDependencies = {
  push: UiPushDependencies;
};

/**
 * Create the UI command group
 */
export function createUiCommandGroup(deps: UiCommandGroupDependencies): Command {
  const uiCommand = new Command('ui');
  uiCommand.description('UI management commands');
  
  uiCommand.addCommand(withCommonOptions(createUiPushCommand(deps.push)));
  
  return uiCommand;
}

export { createUiPushCommand };
