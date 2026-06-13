import { Command } from 'commander';

import { createProjectListCommand, ProjectListDependencies } from './list';
import { createProjectCreateCommand, ProjectCreateDependencies } from './create';
import { createProjectDeleteCommand, ProjectDeleteDependencies } from './delete';
import { withCommonOptions } from '../common-options';

export type ProjectCommandGroupDependencies = {
  list: ProjectListDependencies;
  create: ProjectCreateDependencies;
  delete: ProjectDeleteDependencies;
};

/**
 * Creates the `project` command group.
 *
 * Includes:
 *   - `project create` — create a new project
 *   - `project list`   — list all projects
 *   - `project delete` — delete a project and its resources
 */
export function createProjectCommandGroup(deps: ProjectCommandGroupDependencies): Command {
  const command = new Command('project');

  command
    .alias('projects')
    .description('Manage projects');

  command.addCommand(withCommonOptions(createProjectCreateCommand(deps.create)));
  command.addCommand(withCommonOptions(createProjectListCommand(deps.list)));
  command.addCommand(withCommonOptions(createProjectDeleteCommand(deps.delete)));

  return command;
}
