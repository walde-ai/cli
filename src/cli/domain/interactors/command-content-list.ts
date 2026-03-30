import { WaldeAdminFactory, CredentialsProvider } from '@walde.ai/sdk';
import { IContentPresenter } from '@/cli/domain/ports/presenters/i-content-presenter';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { SystemError } from '@/cli/domain/exceptions';

/**
 * Command interactor for content list operation
 */
export class CommandContentList {
  constructor(
    private readonly siteId: string,
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: IContentPresenter,
    private readonly configLoader: ILoadConfig
  ) {}

  async execute(): Promise<void> {
    this.presenter.startLoading('Loading contents...');

    try {
      const config = await this.configLoader.execute();
      const walde = WaldeAdminFactory.createAdmin({ 
        credentialsProvider: this.credentialsProvider,
        endpoint: config.settings.endpoint,
        clientId: config.settings.clientId,
        region: config.settings.region,
        s3ClientFactory: config.s3ClientFactory
      });

      const result = await walde.site({ id: this.siteId }).contents().list().resolve();

      this.presenter.stopLoading();

      if (result.isOk()) {
        this.presenter.presentContents(result.unwrap());
      } else {
        throw new SystemError(result.unwrapErr().message);
      }
    } catch (error) {
      this.presenter.stopLoading();
      throw error;
    }
  }
}
