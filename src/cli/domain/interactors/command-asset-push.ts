import { WaldeAdminFactory } from '@walde.ai/sdk';
import { CredentialsProvider } from '@walde.ai/sdk';

import { IAssetPresenter } from '@/cli/domain/ports/presenters/i-asset-presenter';
import { WorkspaceConfigRepo } from '@walde.ai/sdk';
import { ResolveSiteId } from './resolve-site-id';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { resolve, relative } from 'path';
import { stat } from 'fs/promises';
import { UserError } from '@/cli/domain/exceptions';

export class CommandAssetPush {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: IAssetPresenter,
    private readonly workspaceConfigRepo: WorkspaceConfigRepo,
    private readonly resolveSiteId: ResolveSiteId,
    private readonly configLoader: ILoadConfig
  ) {}

  async execute(options: { filePath: string; key?: string; siteId?: string; noCacheInvalidation?: boolean }): Promise<void> {
    try {
      const workspaceConfig = await this.workspaceConfigRepo.findWorkspace();
      const siteId = this.resolveSiteId.execute(options.siteId, workspaceConfig, true);
      if (!siteId) {
        throw new UserError('Site ID is required for asset push command');
      }

      const resolvedFilePath = resolve(options.filePath);
      const fileStats = await stat(resolvedFilePath);
      if (!fileStats.isFile()) {
        throw new UserError(`Path ${options.filePath} is not a file`);
      }

      let assetKey: string;
      if (options.key) {
        if (options.key.includes('..') || options.key.startsWith('/')) {
          throw new UserError('Asset key must not contain ".." or start with "/"');
        }
        assetKey = options.key;
      } else {
        const assetsPath = workspaceConfig?.paths?.assets || 'assets';
        const resolvedAssetsPath = resolve(assetsPath);
        const relativePath = relative(resolvedAssetsPath, resolvedFilePath);
        if (relativePath.startsWith('..')) {
          throw new UserError(`File ${options.filePath} is outside the assets folder (${assetsPath}). Use --key to override.`);
        }
        assetKey = relativePath;
      }

      this.presenter.showStarting(resolvedFilePath);

      const config = await this.configLoader.execute();
      const walde = WaldeAdminFactory.createAdmin({
        credentialsProvider: this.credentialsProvider,
        endpoint: config.settings.endpoint,
        clientId: config.settings.clientId,
        region: config.settings.region,
        s3ClientFactory: config.s3ClientFactory
      });

      const result = await walde.site({ id: siteId })
        .asset({ key: assetKey })
        .upload({ path: resolvedFilePath })
        .resolve();

      if (result.isErr()) {
        this.presenter.showError(result.unwrapErr().message);
        return;
      }

      this.presenter.showUploadSummary(1, 0);

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
