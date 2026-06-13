import { Command } from 'commander';
import { withCommonOptions } from '../common-options';
import { createBriefCreateCommand, BriefCreateDependencies } from './create';
import { createBriefListCommand, BriefListDependencies } from './list';
import { createBriefShowCommand, BriefShowDependencies } from './show';
import { createBriefEventsCommand, BriefEventsDependencies } from './events';
import { createBriefSetSectionsCommand, BriefSetSectionsDependencies } from './set-sections';
import { createBriefImplementCommand, BriefImplementDependencies } from './implement';
import { createBriefMarkImplementedCommand, BriefMarkImplementedDependencies } from './mark-implemented';
import { createBriefFailCommand, BriefFailDependencies } from './fail';
import { createBriefArchiveCommand, BriefArchiveDependencies } from './archive';
import { createBriefCommentCommandGroup, BriefCommentCommandGroupDependencies } from './comment';
import { createBriefEventCommandGroup, BriefEventCommandGroupDependencies } from './event';

export type BriefCommandGroupDependencies = {
  create: BriefCreateDependencies;
  list: BriefListDependencies;
  show: BriefShowDependencies;
  events: BriefEventsDependencies;
  setSections: BriefSetSectionsDependencies;
  implement: BriefImplementDependencies;
  markImplemented: BriefMarkImplementedDependencies;
  fail: BriefFailDependencies;
  archive: BriefArchiveDependencies;
  comment: BriefCommentCommandGroupDependencies;
  event: BriefEventCommandGroupDependencies;
};

export function createBriefCommandGroup(deps: BriefCommandGroupDependencies): Command {
  const command = new Command('brief');

  command
    .alias('briefs')
    .description('Manage briefs');

  command.addCommand(withCommonOptions(createBriefCreateCommand(deps.create)));
  command.addCommand(withCommonOptions(createBriefListCommand(deps.list)));
  command.addCommand(withCommonOptions(createBriefShowCommand(deps.show)));
  command.addCommand(withCommonOptions(createBriefEventsCommand(deps.events)));
  command.addCommand(withCommonOptions(createBriefSetSectionsCommand(deps.setSections)));
  command.addCommand(withCommonOptions(createBriefImplementCommand(deps.implement)));
  command.addCommand(withCommonOptions(createBriefMarkImplementedCommand(deps.markImplemented)));
  command.addCommand(withCommonOptions(createBriefFailCommand(deps.fail)));
  command.addCommand(withCommonOptions(createBriefArchiveCommand(deps.archive)));
  command.addCommand(createBriefCommentCommandGroup(deps.comment));
  command.addCommand(createBriefEventCommandGroup(deps.event));

  return command;
}
