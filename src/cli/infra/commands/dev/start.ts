import { Command } from 'commander';

import { CommandDevStart } from '@/cli/domain/interactors/command-dev-start';
import { ProcessSpawner } from '@/cli/domain/ports/out/process-spawner';
import { WorkspaceRootResolver } from '@/cli/domain/ports/out/workspace-root-resolver';
import { Runtime } from '@/cli/infra/runtime';

export type DevStartDependencies = {
  workspaceRootResolver: WorkspaceRootResolver;
  processSpawner: ProcessSpawner;
};

export function createDevStartCommand(deps: DevStartDependencies): Command {
  const command = new Command('start');

  command
    .description('Start local cloud API and UI development servers')
    .option('--path <path>', 'Project root path (defaults to nearest walde.json from current directory)')
    .action(async (options) => {
      await executeDevStart(deps, options.path);
    });

  return command;
}

export async function executeDevStart(deps: DevStartDependencies, targetPath?: string): Promise<void> {
  const runtime = new Runtime();
  await runtime.run(async () => {
    const interactor = new CommandDevStart(deps.workspaceRootResolver, deps.processSpawner);
    await interactor.execute({ path: targetPath });
  });
}
