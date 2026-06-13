import { Command } from 'commander';
import { CredentialsProvider } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { CommandWorkspaceInitFactory } from '@/cli/infra/factories/command-workspace-init-factory';
import { Runtime } from '@/cli/infra/runtime';

export type InitDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
};

/**
 * Creates the init command.
 *
 * `walde init [project-id]` bootstraps a local workspace. When a project-id is
 * supplied it seeds a minimal walde.json, then waits for the backend project to
 * become ACTIVE, prompts the user for ui/content settings, and persists the full
 * walde.json.  Without a project-id the command expects an existing walde.json
 * that already contains a projectId.
 */
export function createInitCommand(deps: InitDependencies): Command {
  const command = new Command('init');

  command
    .description('Initialise a Walde workspace')
    .argument('[project-id]', 'Project ID to initialise (creates walde.json when provided)')
    .option('--path <path>', 'Workspace directory path (defaults to current directory)')
    .action(async (projectId, options) => {
      await executeInit(deps, projectId, options);
    });

  return command;
}

async function executeInit(deps: InitDependencies, projectId: string | undefined, options: { path?: string }): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    const commandWorkspaceInit = CommandWorkspaceInitFactory.Create(
      deps.credentialsProvider,
      deps.configLoader
    );

    await commandWorkspaceInit.execute({
      targetPath: options.path,
      projectId,
    });
  });
}
