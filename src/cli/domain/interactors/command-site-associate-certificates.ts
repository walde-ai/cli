import { MakeWaldeAdmin, CredentialsProvider, CustomDomainStatus, CustomDomain } from '@walde.ai/sdk';
import { ISitePresenter } from '@/cli/domain/ports/presenters/i-site-presenter';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';

/**
 * Command interactor for site certificate association operation.
 */
export class CommandSiteAssociateCertificates {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: ISitePresenter,
    private readonly configLoader: ILoadConfig
  ) {}

  async execute(siteId: string): Promise<void> {
    try {
      this.presenter.startLoading('Associating certificates...');

      const config = await this.configLoader.execute();
      const walde = MakeWaldeAdmin({
        credentialsProvider: this.credentialsProvider,
        endpoint: config.settings.endpoint,
        clientId: config.settings.clientId,
        region: config.settings.region,
        s3ClientFactory: config.s3ClientFactory
      });

      const result = await walde.site({ id: siteId }).associateCertificates().resolve();

      this.presenter.stopLoading();

      if (result.isOk()) {
        const site = result.unwrap();
        const allVerified = site.customDomains.length > 0 &&
          site.customDomains.every((cd: CustomDomain) => cd.status === CustomDomainStatus.VERIFIED);

        if (allVerified) {
          this.presenter.presentCertificateAssociationSuccess();
        } else {
          this.presenter.presentCertificateAssociationPartial(site);
        }
      } else {
        this.presenter.presentError(result.unwrapErr());
      }
    } catch (error) {
      this.presenter.stopLoading();
      this.presenter.presentError(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}
