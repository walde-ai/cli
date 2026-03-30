import { Command } from 'commander';
import { IFrontendManifestPresenter } from '@/cli/domain/ports/presenters/i-frontend-manifest-presenter';
import { CommandFrontendManifestList } from '@/cli/domain/interactors/command-frontend-manifest-list';
import { Runtime } from '@/cli/infra/runtime';

export type FrontendManifestListDependencies = {
  presenter: IFrontendManifestPresenter;
};

/**
 * Creates the manifest list command
 */
export function createListCommand(deps: FrontendManifestListDependencies): Command {
  const command = new Command('list');
  
  command
    .description('List manifest contents')
    .requiredOption('--url <url>', 'Frontend URL to load manifest from')
    .action(async (options) => {
      await executeManifestList(deps, options.url);
    });

  return command;
}

/**
 * Execute the manifest list command
 */
async function executeManifestList(deps: FrontendManifestListDependencies, url: string): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    const command = new CommandFrontendManifestList(deps.presenter);
    await command.execute(url);
  });
}
