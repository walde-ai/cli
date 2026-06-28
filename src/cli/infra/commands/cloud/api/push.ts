import { Command } from 'commander';

import { CredentialsProvider } from '@walde.ai/sdk';
import { ResolveTarget, IProjectRepository } from '@/cli/domain/interactors/resolve-target';
import { Runtime } from '@/cli/infra/runtime';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { IPushPresenter } from '@/cli/domain/ports/presenters/i-push-presenter';
import { ICloudDependencyInstaller } from '@/cli/domain/ports/out/cloud-dependency-installer';
import { CommandCloudApiPush } from '@/cli/domain/interactors/command-cloud-api-push';
import { PushPresenterV1 } from '@/cli/infra/presenters/push-presenter-v1';

export type CloudApiPushDependencies = {
  credentialsProvider: CredentialsProvider;
  configLoader: ILoadConfig;
  presenter?: IPushPresenter;
  projectRepository: IProjectRepository;
  cloudDependencyInstaller: ICloudDependencyInstaller;
};

export function createCloudApiPushCommand(deps: CloudApiPushDependencies): Command {
  const command = new Command('push');

  command
    .description('Compile and deploy cloud API handlers')
    .option('--path <path>', 'Cloud API source directory (default: dev/cloud/src/apis)')
    .option('--site-id <siteId>', 'Site identifier')
    .option('--target <stageName>', 'Project stage to deploy to (default: prod)')
    .action(async (options: { path?: string; siteId?: string; target?: string }) => {
      const runtime = new Runtime();
      await runtime.run(async () => {
        const resolveTarget = new ResolveTarget(deps.projectRepository);
        const presenter = deps.presenter ?? new PushPresenterV1();
        const interactor = new CommandCloudApiPush(
          resolveTarget,
          presenter,
          deps.credentialsProvider,
          deps.configLoader,
          deps.cloudDependencyInstaller
        );

        await interactor.execute({
          path: options.path,
          siteId: options.siteId,
          target: options.target,
        });
      });
    });

  return command;
}
