import { Command } from 'commander';
import { createCurlCommand, CurlDependencies } from './curl';

export type CurlCommandGroupDependencies = {
  curl: CurlDependencies;
};

/**
 * Creates the curl command group
 */
export function createCurlCommandGroup(deps: CurlCommandGroupDependencies): Command {
  return createCurlCommand(deps.curl);
}
