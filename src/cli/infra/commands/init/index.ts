import { Command } from 'commander';
import { createInitCommand, InitDependencies } from './init';

export type InitCommandGroupDependencies = {
  init: InitDependencies;
};

/**
 * Creates the init command group
 */
export function createInitCommandGroup(deps: InitCommandGroupDependencies): Command {
  return createInitCommand(deps.init);
}

export type { InitDependencies } from './init';
