import { Command } from 'commander';
import { withCommonOptions } from '../common-options';
import { createKbSearchCommand, KbSearchDependencies } from './search';
import { createKbFetchCommand, KbFetchDependencies } from './fetch';

export type KbCommandGroupDependencies = {
  search: KbSearchDependencies;
  fetch: KbFetchDependencies;
};

export function createKbCommandGroup(deps: KbCommandGroupDependencies): Command {
  const command = new Command('kb');

  command.description('Read a project knowledge base');

  command.addCommand(withCommonOptions(createKbSearchCommand(deps.search)));
  command.addCommand(withCommonOptions(createKbFetchCommand(deps.fetch)));

  return command;
}
