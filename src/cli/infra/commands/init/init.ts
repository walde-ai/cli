import { Command } from 'commander';
import { CredentialsProvider } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { CommandWorkspaceInitFactory } from '@/cli/infra/factories/command-workspace-init-factory';
import { Runtime } from '@/cli/infra/runtime';
import { getCurrentStage } from '../common-options';

export type InitDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
};

/**
 * Creates the init command
 */
export function createInitCommand(deps: InitDependencies): Command {
  const command = new Command('init');
  
  command
    .description('Initialize a workspace for a Walde site')
    .option('--path <path>', 'Target directory path')
    .option('--site-id <siteId>', 'Existing site ID to use')
    .option('--create-site <domain>', 'Domain name for new site creation')
    .option('--region <region>', 'AWS region for new site (used with --create-site)')
    .action(async (options) => {
      await executeInit(deps, options);
    });

  return command;
}

/**
 * Execute the init command
 */
async function executeInit(deps: InitDependencies, options: any): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    const commandWorkspaceInit = CommandWorkspaceInitFactory.Create(
      deps.credentialsProvider,
      deps.configLoader
    );
    
    await commandWorkspaceInit.execute({
      targetPath: options.path,
      siteId: options.siteId,
      createSiteName: options.createSite,
      createSiteRegion: options.region,
      stage: getCurrentStage()
    });
  });
}
