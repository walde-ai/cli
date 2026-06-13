import { MakeWaldeAdmin } from '@walde.ai/sdk';
import { CredentialsProvider } from '@walde.ai/sdk';

import { IAssetPresenter } from '@/cli/domain/ports/presenters/i-asset-presenter';
import { WorkspaceConfigRepo } from '@walde.ai/sdk';
import { ResolveTarget } from './resolve-target';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { resolve, relative } from 'path';
import { stat } from 'fs/promises';
import { UserError } from '@/cli/domain/exceptions';
import { ProjectWorkspaceConfig } from '@walde.ai/sdk';

export class CommandAssetPush {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: IAssetPresenter,
    private readonly workspaceConfigRepo: WorkspaceConfigRepo,
    private readonly resolveTarget: ResolveTarget,
    private readonly configLoader: ILoadConfig
  ) {}

  async execute(options: { filePath: string; key?: string; siteId?: string; target?: string; noCacheInvalidation?: boolean }): Promise<void> {
    try {
      let workspaceConfig: ProjectWorkspaceConfig | undefined;

      if (!options.siteId || !options.key) {
        const found = await this.workspaceConfigRepo.findWorkspace();
        if (!found) {
          if (!options.siteId) {
            throw new UserError('No workspace detected and no --site-id provided. Either run from a workspace directory or specify --site-id option.');
          }
        } else {
          workspaceConfig = found;
        }
      }

      const { siteId } = await this.resolveTarget.execute({
        siteIdOption: options.siteId,
        targetOption: options.target,
        workspaceConfig
      });

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
        if (!workspaceConfig) {
          throw new UserError('--key is required when using --site-id without a workspace');
        }
        const assetsPath = workspaceConfig.content.assetsPath;
        const resolvedAssetsPath = resolve(assetsPath);
        const relativePath = relative(resolvedAssetsPath, resolvedFilePath);
        if (relativePath.startsWith('..')) {
          throw new UserError(`File ${options.filePath} is outside the assets folder (${assetsPath}). Use --key to override.`);
        }
        assetKey = relativePath;
      }

      this.presenter.showStarting(resolvedFilePath);

      const config = await this.configLoader.execute();
      const walde = MakeWaldeAdmin({
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
