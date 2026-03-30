import { Command } from 'commander';
import { createCacheInvalidateCommand, CacheInvalidateDependencies } from './invalidate';
import { withCommonOptions } from '../common-options';

export type CacheCommandGroupDependencies = {
  invalidate: CacheInvalidateDependencies;
};

/**
 * Create the cache command group
 */
export function createCacheCommandGroup(deps: CacheCommandGroupDependencies): Command {
  const cacheCommand = new Command('cache');
  cacheCommand.description('Cache management commands');

  cacheCommand.addCommand(withCommonOptions(createCacheInvalidateCommand(deps.invalidate)));

  return cacheCommand;
}
