import { MakeWaldeAdmin, CredentialsProvider } from '@walde.ai/sdk';
import { ISitePresenter } from '@/cli/domain/ports/presenters/i-site-presenter';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { SystemError } from '@/cli/domain/exceptions';

/**
 * Command interactor for site list operation
 */
export class CommandSiteList {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: ISitePresenter,
    private readonly configLoader: ILoadConfig
  ) {}

  async execute(): Promise<void> {
    this.presenter.startLoading('Loading sites...');

    try {
      const config = await this.configLoader.execute();
      const walde = MakeWaldeAdmin({ 
        credentialsProvider: this.credentialsProvider,
        endpoint: config.settings.endpoint,
        clientId: config.settings.clientId,
        region: config.settings.region,
        s3ClientFactory: config.s3ClientFactory
      });
      const result = await walde.sites().list().resolve();

      this.presenter.stopLoading();

      if (result.isOk()) {
        this.presenter.presentSites(result.unwrap());
      } else {
        throw new SystemError(result.unwrapErr());
      }
    } catch (error) {
      this.presenter.stopLoading();
      throw error;
    }
  }
}
