import { Command } from 'commander';
import { createManifestCommandGroup, FrontendManifestCommandGroupDependencies } from './manifest/index';
import { createContentCommand, FrontendContentDependencies } from './content';
import { withCommonOptions } from '../common-options';

export type FrontendCommandGroupDependencies = {
  content: FrontendContentDependencies;
  manifest: FrontendManifestCommandGroupDependencies;
};

/**
 * Creates the frontend command group
 */
export function createFrontendCommandGroup(deps: FrontendCommandGroupDependencies): Command {
  const command = new Command('frontend');
  
  command
    .description('Frontend content operations');

  command.addCommand(withCommonOptions(createManifestCommandGroup(deps.manifest)));
  command.addCommand(withCommonOptions(createContentCommand(deps.content)));

  return command;
}
