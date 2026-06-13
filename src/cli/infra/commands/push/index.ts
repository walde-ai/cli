import { Command } from 'commander';
import { createPushCommand, PushCommandDependencies } from './push';

export type PushCommandGroupDependencies = {
  push: PushCommandDependencies;
};

/**
 * Creates the push command group (single command, not a subcommand group)
 */
export function createPushCommandGroup(deps: PushCommandGroupDependencies): Command {
  return createPushCommand(deps.push);
}

export type { PushCommandDependencies } from './push';
