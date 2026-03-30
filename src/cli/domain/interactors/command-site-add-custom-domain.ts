import { WaldeAdminFactory, CredentialsProvider } from '@walde.ai/sdk';
import { ISitePresenter } from '@/cli/domain/ports/presenters/i-site-presenter';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';

/**
 * Command interactor for adding a custom domain to a site.
 */
export class CommandSiteAddCustomDomain {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: ISitePresenter,
    private readonly configLoader: ILoadConfig
  ) {}

  async execute(siteId: string, domain: string): Promise<void> {
    try {
      this.presenter.startLoading(`Adding custom domain "${domain}" to site ${siteId}...`);

      const config = await this.configLoader.execute();
      const walde = WaldeAdminFactory.createAdmin({
        credentialsProvider: this.credentialsProvider,
        endpoint: config.settings.endpoint,
        clientId: config.settings.clientId,
        region: config.settings.region,
        s3ClientFactory: config.s3ClientFactory
      });

      const result = await walde.site({ id: siteId }).addCustomDomain(domain).resolve();

      this.presenter.stopLoading();

      if (result.isOk()) {
        const site = result.unwrap();
        this.presenter.presentCustomDomainAdded(site, domain);
      } else {
        this.presenter.presentError(result.unwrapErr());
      }
    } catch (error) {
      this.presenter.stopLoading();
      this.presenter.presentError(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}
