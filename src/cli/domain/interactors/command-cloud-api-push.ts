import { resolve } from 'path';
import { stat } from 'fs/promises';

import { CredentialsProvider, MakeWaldeAdmin, ProjectWorkspaceConfig } from '@walde.ai/sdk';
import { ResolveTarget } from './resolve-target';
import { IPushPresenter } from '@/cli/domain/ports/presenters/i-push-presenter';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { ICloudDependencyInstaller } from '@/cli/domain/ports/out/cloud-dependency-installer';
import { UserError } from '@/cli/domain/exceptions';
import { FileWorkspaceConfigRepo } from '@walde.ai/sdk';

export interface CommandCloudApiPushOptions {
  path?: string;
  siteId?: string;
  target?: string;
}

/**
 * Command interactor for cloud API pushes.
 */
export class CommandCloudApiPush {
  constructor(
    private readonly resolveTarget: ResolveTarget,
    private readonly presenter: IPushPresenter,
    private readonly credentialsProvider: CredentialsProvider,
    private readonly configLoader: ILoadConfig,
    private readonly cloudDependencyInstaller: ICloudDependencyInstaller
  ) {}

  async execute(options: CommandCloudApiPushOptions): Promise<void> {
    const workspaceConfigRepo = new FileWorkspaceConfigRepo();
    const workspaceResult = await workspaceConfigRepo.findWorkspaceWithRoot();

    if (!workspaceResult) {
      throw new UserError('No workspace detected. Run "walde init" to initialize a workspace.');
    }

    await this.executeResolved(workspaceResult.config, workspaceResult.rootPath, options);
  }

  async executeResolved(workspaceConfig: ProjectWorkspaceConfig, rootPath: string, options: CommandCloudApiPushOptions): Promise<void> {
    const cloudApisPath = resolve(rootPath, options.path ?? 'dev/cloud/src/apis');
    const stats = await stat(cloudApisPath);
    if (!stats.isDirectory()) {
      throw new UserError(`Cloud API path ${cloudApisPath} is not a directory`);
    }

    const { siteId } = await this.resolveTarget.execute({
      siteIdOption: options.siteId,
      targetOption: options.target,
      workspaceConfig,
    });

    const config = await this.configLoader.execute();
    const walde = MakeWaldeAdmin({
      credentialsProvider: this.credentialsProvider,
      endpoint: config.settings.endpoint,
      clientId: config.settings.clientId,
      region: config.settings.region,
      s3ClientFactory: config.s3ClientFactory,
    });

    await this.runStep('Installing cloud dependencies...', async () => {
      await this.cloudDependencyInstaller.install({ cloudApisDirectory: cloudApisPath });
    });

    await this.runStep('Pushing cloud APIs...', async () => {
      const result = await walde.site({ id: siteId })
        .cloud()
        .api()
        .directory({ path: cloudApisPath })
        .push()
        .resolve();

      if (result.isErr()) {
        throw result.unwrapErr();
      }
    });
  }

  private async runStep(label: string, action: () => Promise<void> | void): Promise<void> {
    this.presenter.startStep(label);
    const startTime = Date.now();
    try {
      await action();
      this.presenter.completeStep(Date.now() - startTime);
    } catch (error) {
      this.presenter.failStep(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
}
