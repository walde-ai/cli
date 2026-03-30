import { WaldeAdminFactory, CredentialsProvider } from '@walde.ai/sdk';
import { IContentPresenter } from '@/cli/domain/ports/presenters/i-content-presenter';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';

/**
 * Command interactor for push all content operation
 */
export class CommandPushAll {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: IContentPresenter,
    private readonly configLoader: ILoadConfig
  ) {}

  async execute(siteId: string, contentPath: string, noCacheInvalidation?: boolean): Promise<void> {
    try {
      const config = await this.configLoader.execute();
      const walde = WaldeAdminFactory.createAdmin({ 
        credentialsProvider: this.credentialsProvider,
        endpoint: config.settings.endpoint,
        clientId: config.settings.clientId,
        region: config.settings.region,
        s3ClientFactory: config.s3ClientFactory
      });

      let successCount = 0;
      let errorCount = 0;
      let started = false;

      const onProgress = (current: number, total: number, filePath: string, success: boolean, error?: Error) => {
        if (!started) {
          this.presenter.startProgress(total);
          started = true;
        }
        
        this.presenter.updateProgress(current, filePath);
        
        if (success) {
          this.presenter.showContentPushed(filePath);
          successCount++;
        } else {
          this.presenter.showContentError(filePath, error || new Error('Unknown error'));
          errorCount++;
        }
      };

      const iterator = walde.site({ id: siteId }).uploadContentsFromFolder({ 
        path: contentPath,
        onProgress
      });

      await iterator.resolve();
      
      this.presenter.stopProgress();
      this.presenter.showPushSummary(successCount, errorCount);

      if (!noCacheInvalidation) {
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
      this.presenter.showError((error as Error).message);
      throw error;
    }
  }
}
