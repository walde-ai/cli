import { WaldeAdminFactory } from '@walde.ai/sdk';
import { CredentialsProvider } from '@walde.ai/sdk';
import { IUiPresenter } from '@/cli/domain/ports/presenters/i-ui-presenter';
import { WorkspaceConfigRepo } from '@walde.ai/sdk';
import { ResolveSiteId } from './resolve-site-id';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { resolve } from 'path';
import { stat } from 'fs/promises';
import { UserError } from '@/cli/domain/exceptions';

/**
 * Command interactor for UI push operations
 */
export class CommandUiPush {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: IUiPresenter,
    private readonly workspaceConfigRepo: WorkspaceConfigRepo,
    private readonly resolveSiteId: ResolveSiteId,
    private readonly configLoader: ILoadConfig
  ) {}

  /**
   * Execute UI push command
   * @param options - Command options
   */
  async execute(options: { path?: string; siteId?: string; noCacheInvalidation?: boolean }): Promise<void> {
    try {
      // Detect workspace configuration
      const workspaceConfig = await this.workspaceConfigRepo.findWorkspace();
      
      // Resolve UI path from options or workspace config
      let uiPath: string;
      if (options.path) {
        uiPath = options.path;
      } else if (workspaceConfig?.paths?.ui) {
        uiPath = workspaceConfig.paths.ui;
      } else {
        throw new UserError('UI path not specified. Use --path option or configure paths.ui in workspace config');
      }

      // Resolve and validate UI path
      const resolvedUiPath = resolve(uiPath);
      const stats = await stat(resolvedUiPath);
      if (!stats.isDirectory()) {
        throw new UserError(`UI path ${uiPath} is not a directory`);
      }
      
      // Resolve siteId from options or workspace (required for push command)
      const siteId = this.resolveSiteId.execute(options.siteId, workspaceConfig, true);
      
      if (!siteId) {
        throw new UserError('Site ID is required for UI push command');
      }

      this.presenter.showStarting(uiPath);
      
      // Load config to get endpoint and s3ClientFactory
      const config = await this.configLoader.execute();
      
      // Create SDK instance and execute UI upload
      const walde = WaldeAdminFactory.createAdmin({ 
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

      const iterator = walde.site({ id: siteId })
        .uploadUiFromFolder({ path: resolvedUiPath, onProgress });

      const result = await iterator.resolve();
      
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
