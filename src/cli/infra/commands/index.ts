import { Command } from 'commander';
import { createLoginCommandGroup } from './login/index';
import { createCredentialsCommandGroup } from './credentials/index';
import { createCurlCommandGroup } from './curl/index';
import { createSiteCommandGroup } from './site/index';
import { createContentCommandGroup } from './content/index';
import { createInitCommandGroup } from './init/index';
import { createUiCommandGroup } from './ui/index';
import { createFrontendCommandGroup } from './frontend/index';
import { createAssetCommandGroup } from './asset/index';
import { createCacheCommandGroup } from './cache/index';
import { DependencyFactory } from '@/cli/infra/factories/dependency-factory';
import { withCommonOptions } from './common-options';

// Import version - this will be resolved at build time
import packageJson from '../../../../package.json' with { type: 'json' };

/**
 * Create and configure the CLI program
 */
export function createProgram(factory: DependencyFactory): Command {
  const program = new Command();

  program
    .name('walde')
    .description('CLI tool for Walde - create sites, content, and deploy UI')
    .version(packageJson.version);

  program.addCommand(withCommonOptions(createLoginCommandGroup(factory.createLoginCommandGroupDependencies())));
  program.addCommand(withCommonOptions(createCredentialsCommandGroup(factory.createCredentialsCommandGroupDependencies())));
  program.addCommand(withCommonOptions(createCurlCommandGroup(factory.createCurlCommandGroupDependencies())));
  program.addCommand(withCommonOptions(createSiteCommandGroup(factory.createSiteCommandGroupDependencies())));
  program.addCommand(withCommonOptions(createContentCommandGroup(factory.createContentCommandGroupDependencies())));
  program.addCommand(withCommonOptions(createInitCommandGroup(factory.createInitCommandGroupDependencies())));
  program.addCommand(withCommonOptions(createUiCommandGroup(factory.createUiCommandGroupDependencies())));
  program.addCommand(withCommonOptions(createFrontendCommandGroup(factory.createFrontendCommandGroupDependencies())));
  program.addCommand(withCommonOptions(createAssetCommandGroup(factory.createAssetCommandGroupDependencies())));
  program.addCommand(withCommonOptions(createCacheCommandGroup(factory.createCacheCommandGroupDependencies())));

  return program;
}
