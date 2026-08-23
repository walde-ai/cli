import { Command } from 'commander';

import { createFormatListCommand, FormatListDependencies } from './list';
import { createFormatCreateCommand, FormatCreateDependencies } from './create';
import { createFormatEditCommand, FormatEditDependencies } from './edit';
import { createFormatDeleteCommand, FormatDeleteDependencies } from './delete';
import { withCommonOptions } from '../common-options';

export type FormatCommandGroupDependencies = {
  list: FormatListDependencies;
  create: FormatCreateDependencies;
  edit: FormatEditDependencies;
  delete: FormatDeleteDependencies;
};

/**
 * Creates the `format` command group.
 *
 * Includes:
 *   - `format list`          — list the project's custom formats
 *   - `format create`        — create a custom format
 *   - `format edit <id>`     — replace a custom format's definition
 *   - `format delete <id>`   — delete a custom format
 */
export function createFormatCommandGroup(deps: FormatCommandGroupDependencies): Command {
  const command = new Command('format');

  command
    .alias('formats')
    .description('Manage custom post formats');

  command.addCommand(withCommonOptions(createFormatListCommand(deps.list)));
  command.addCommand(withCommonOptions(createFormatCreateCommand(deps.create)));
  command.addCommand(withCommonOptions(createFormatEditCommand(deps.edit)));
  command.addCommand(withCommonOptions(createFormatDeleteCommand(deps.delete)));

  return command;
}
