import { MakeWaldeAdmin } from '@walde.ai/sdk';
import { CredentialsProvider } from '@walde.ai/sdk';

import { IAssetPresenter } from '@/cli/domain/ports/presenters/i-asset-presenter';
import { WorkspaceConfigRepo } from '@walde.ai/sdk';
import { ResolveTarget } from './resolve-target';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { resolve } from 'path';
import { stat } from 'fs/promises';
import { UserError } from '@/cli/domain/exceptions';
import { ProjectWorkspaceConfig } from '@walde.ai/sdk';

export class CommandAssetPushAll {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: IAssetPresenter,
    private readonly workspaceConfigRepo: WorkspaceConfigRepo,
    private readonly resolveTarget: ResolveTarget,
    private readonly configLoader: ILoadConfig
  ) {}

  async execute(options: { path?: string; siteId?: string; target?: string; noCacheInvalidation?: boolean }): Promise<void> {
    try {
      let workspaceConfig: ProjectWorkspaceConfig | undefined;

      if (!options.siteId || !options.path) {
        const found = await this.workspaceConfigRepo.findWorkspace();
        if (!found) {
          if (!options.siteId) {
            throw new UserError('No workspace detected and no --site-id provided. Either run from a workspace directory or specify --site-id option.');
          }
        } else {
          workspaceConfig = found;
        }
      }

      let assetsPath: string;
      if (options.path) {
        assetsPath = options.path;
      } else {
        if (!workspaceConfig) {
          throw new UserError('--path is required when using --site-id without a workspace');
        }
        assetsPath = workspaceConfig.content.assetsPath;
      }

      const resolvedAssetsPath = resolve(assetsPath);
      const stats = await stat(resolvedAssetsPath);
      if (!stats.isDirectory()) {
        throw new UserError(`Asset path ${assetsPath} is not a directory`);
      }

      const { siteId } = await this.resolveTarget.execute({
        siteIdOption: options.siteId,
        targetOption: options.target,
        workspaceConfig
      });

      this.presenter.showStarting(assetsPath);

      const config = await this.configLoader.execute();
      const walde = MakeWaldeAdmin({
        credentialsProvider: this.credentialsProvider,
        endpoint: config.settings.endpoint,
        clientId: config.settings.clientId,
        region: config.settings.region,
        s3ClientFactory: config.s3ClientFactory
      });

      this.presenter.startLoading('Preparing to upload...');

      let successCount = 0;
      let errorCount = 0;
      let started = false;

      const onProgress = (current: number, total: number, filePath: string, success: boolean, error?: Error) => {
        if (!started) {
          this.presenter.stopLoading();
          this.presenter.startProgress(total);
          started = true;
        }

        this.presenter.updateProgress(current, filePath);

        if (success) {
          this.presenter.showFileUploaded(filePath);
          successCount++;
        } else {
          this.presenter.showFileError(filePath, error || new Error('Unknown error'));
          errorCount++;
        }
      };

      const future = walde.site({ id: siteId })
        .uploadAssetsFromFolder({ path: resolvedAssetsPath, onProgress });

      const result = await future.resolve();

      if (result.isErr()) {
        if (started) {
          this.presenter.stopProgress();
        } else {
          this.presenter.stopLoading();
        }
        this.presenter.showError(result.unwrapErr().message);
        return;
      }

      this.presenter.stopProgress();
      this.presenter.showUploadSummary(successCount, errorCount);

      if (!options.noCacheInvalidation) {
        const invalidationResult = await walde.site({ id: siteId })
          .invalidateCache()
          .resolve();

        if (invalidationResult.isErr()) {
          this.presenter.showWarning(`Cache invalidation failed: ${invalidationResult.unwrapErr().message}`);
        } else {
          // Invalidation succeeded; no action needed
        }
      } else {
        // Cache invalidation skipped per --no-cache-invalidation flag
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  }
}
