import { MakeWaldeAdmin, CredentialsProvider } from '@walde.ai/sdk';
import { ISitePresenter } from '@/cli/domain/ports/presenters/i-site-presenter';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';

/**
 * Command interactor for site delete operation.
 *
 * Requests deletion of a site and polls until deletion completes, displaying
 * a spinner while resources are being torn down asynchronously.
 */
export class CommandSiteDelete {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: ISitePresenter,
    private readonly configLoader: ILoadConfig
  ) {}

  async execute(siteId: string, options: { confirm?: boolean }): Promise<void> {
    try {
      const confirmed = options.confirm || await this.presenter.requestDeleteConfirmation(siteId);

      if (!confirmed) {
        this.presenter.presentDeletionCancelled();
        return;
      }

      this.presenter.startLoading('Requesting site deletion...');

      const config = await this.configLoader.execute();
      const walde = MakeWaldeAdmin({
        credentialsProvider: this.credentialsProvider,
        endpoint: config.settings.endpoint,
        clientId: config.settings.clientId,
        region: config.settings.region,
        s3ClientFactory: config.s3ClientFactory
      });

      const deleteResult = await walde.site({ id: siteId }).delete().resolve();

      if (deleteResult.isErr()) {
        this.presenter.stopLoading();
        this.presenter.presentError(deleteResult.unwrapErr());
        return;
      }

      this.presenter.stopLoading();
      this.presenter.startLoading('Waiting for site deletion to complete...');

      const awaitResult = await walde.site({ id: siteId }).awaitDeleted().resolve();

      this.presenter.stopLoading();

      if (awaitResult.isOk()) {
        this.presenter.presentSiteDeleted();
      } else {
        this.presenter.presentError(awaitResult.unwrapErr());
      }
    } catch (error) {
      this.presenter.stopLoading();
      this.presenter.presentError(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}
