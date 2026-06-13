import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { MakeWaldeAdmin, CredentialsProvider, ProjectWorkspaceConfig } from '@walde.ai/sdk';
import { ResolveTarget } from '@/cli/domain/interactors/resolve-target';
import { IPushPresenter } from '@/cli/domain/ports/presenters/i-push-presenter';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { resolve } from 'path';

export interface CommandPushOptions {
  targetOption?: string;
  siteIdOption?: string;
  noCacheInvalidation?: boolean;
}

/**
 * Command interactor for the unified push command.
 * Orchestrates: build → push UI → push content → push assets → invalidate cache
 */
export class CommandPush {
  constructor(
    private readonly resolveTarget: ResolveTarget,
    private readonly presenter: IPushPresenter,
    private readonly credentialsProvider: CredentialsProvider,
    private readonly configLoader: ILoadConfig
  ) {}

  async execute(workspaceConfig: ProjectWorkspaceConfig, rootPath: string, options: CommandPushOptions): Promise<void> {
    const { siteId } = await this.resolveTarget.execute({
      siteIdOption: options.siteIdOption,
      targetOption: options.targetOption,
      workspaceConfig
    });

    const config = await this.configLoader.execute();
    const walde = MakeWaldeAdmin({
      credentialsProvider: this.credentialsProvider,
      endpoint: config.settings.endpoint,
      clientId: config.settings.clientId,
      region: config.settings.region,
      s3ClientFactory: config.s3ClientFactory
    });

    if (workspaceConfig.ui.buildCommand !== null) {
      const buildCommand = workspaceConfig.ui.buildCommand;
      const buildCwd = resolve(rootPath, workspaceConfig.ui.workingDirectory);
      await this.runStep('Building UI...', async () => {
        execSync(buildCommand, {
          cwd: buildCwd,
          stdio: 'pipe'
        });
      });
    }

    const uiPath = resolve(rootPath, workspaceConfig.ui.workingDirectory, workspaceConfig.ui.distFolder);
    await this.runStep('Pushing UI...', async () => {
      const result = await walde.site({ id: siteId })
        .uploadUiFromFolder({ path: uiPath })
        .resolve();
      if (result.isErr()) {
        throw result.unwrapErr();
      }
    });

    const contentPath = resolve(rootPath, workspaceConfig.content.contentPath);
    if (existsSync(contentPath)) {
      await this.runStep('Pushing content...', async () => {
        const result = await walde.site({ id: siteId })
          .uploadContentsFromFolder({ path: contentPath })
          .resolve();
        if (result.isErr()) {
          throw result.unwrapErr();
        }
      });
    }

    const assetsPath = resolve(rootPath, workspaceConfig.content.assetsPath);
    if (existsSync(assetsPath)) {
      await this.runStep('Pushing assets...', async () => {
        const result = await walde.site({ id: siteId })
          .uploadAssetsFromFolder({ path: assetsPath })
          .resolve();
        if (result.isErr()) {
          throw result.unwrapErr();
        }
      });
    }

    if (!options.noCacheInvalidation) {
      await this.runStep('Invalidating cache...', async () => {
        const result = await walde.site({ id: siteId })
          .invalidateCache()
          .resolve();
        if (result.isErr()) {
          throw result.unwrapErr();
        }
      });
    }

    const cloudApisPath = resolve(rootPath, 'dev/cloud/src/apis');
    if (existsSync(cloudApisPath)) {
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
  }

  private async runStep(label: string, action: () => Promise<void> | void): Promise<void> {
    this.presenter.startStep(label);
    const startTime = Date.now();
    try {
      await action();
      const elapsedMs = Date.now() - startTime;
      this.presenter.completeStep(elapsedMs);
    } catch (error) {
      this.presenter.failStep(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
}
