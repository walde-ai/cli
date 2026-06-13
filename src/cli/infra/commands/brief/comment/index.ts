import { Command } from 'commander';
import { createBriefCommentAddCommand, BriefCommentAddDependencies } from './add';
import { withCommonOptions } from '../../common-options';

export type BriefCommentCommandGroupDependencies = {
  add: BriefCommentAddDependencies;
};

export function createBriefCommentCommandGroup(deps: BriefCommentCommandGroupDependencies): Command {
  const command = new Command('comment');

  command.description('Sub-commands for managing brief comments (e.g., `brief comment add`)');

  command.addCommand(withCommonOptions(createBriefCommentAddCommand(deps.add)));

  return command;
}
