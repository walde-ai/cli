import { WaldeAdminFactory, CredentialsProvider } from '@walde.ai/sdk';
import { IContentPresenter } from '@/cli/domain/ports/presenters/i-content-presenter';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';

/**
 * Command interactor for content push operation
 */
export class CommandContentPush {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: IContentPresenter,
    private readonly configLoader: ILoadConfig
  ) {}

  async execute(siteId: string, filePath: string, noCacheInvalidation?: boolean): Promise<void> {
    this.presenter.startLoading(`Pushing ${filePath}...`);

    try {
      const config = await this.configLoader.execute();
      const walde = WaldeAdminFactory.createAdmin({
        credentialsProvider: this.credentialsProvider,
        endpoint: config.settings.endpoint,
        clientId: config.settings.clientId,
        region: config.settings.region,
        s3ClientFactory: config.s3ClientFactory
      });

      const result = await walde.site({ id: siteId }).setContentFromFile({ path: filePath }).resolve();

      this.presenter.stopLoading();

      if (result.isOk()) {
        this.presenter.showContentPushed(filePath);
      } else {
        const error = result.unwrapErr();
        throw error;
      }

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
      this.presenter.stopLoading();
      throw error;
    }
  }
}
