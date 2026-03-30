import { Command } from 'commander';
import { createListCommand, FrontendManifestListDependencies } from './list';
import { withCommonOptions } from '../../common-options';

export type FrontendManifestCommandGroupDependencies = {
  list: FrontendManifestListDependencies;
};

/**
 * Creates the manifest command group
 */
export function createManifestCommandGroup(deps: FrontendManifestCommandGroupDependencies): Command {
  const command = new Command('manifest');
  
  command
    .description('Manifest operations');

  command.addCommand(withCommonOptions(createListCommand(deps.list)));

  return command;
}
