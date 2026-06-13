import { MakeWaldeAdmin, CredentialsProvider } from '@walde.ai/sdk';
import { ISitePresenter } from '@/cli/domain/ports/presenters/i-site-presenter';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';

/**
 * Command interactor for site create operation.
 *
 * Creates a site and polls until provisioning completes, displaying
 * a spinner while resources are being provisioned asynchronously.
 */
export class CommandSiteCreate {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: ISitePresenter,
    private readonly configLoader: ILoadConfig
  ) {}

  async execute(siteName: string | undefined, region: string): Promise<void> {
    try {
      const finalSiteName = siteName !== undefined ? siteName : await this.presenter.requestSiteName();

      this.presenter.startLoading('Creating site...');

      const config = await this.configLoader.execute();
      const walde = MakeWaldeAdmin({ 
        credentialsProvider: this.credentialsProvider,
        endpoint: config.settings.endpoint,
        clientId: config.settings.clientId,
        region: config.settings.region,
        s3ClientFactory: config.s3ClientFactory
      });

      const createResult = await walde.sites().create({ name: finalSiteName, region }).resolve();

      if (createResult.isErr()) {
        this.presenter.stopLoading();
        this.presenter.presentError(createResult.unwrapErr());
        return;
      }

      const createdSite = createResult.unwrap();
      if (!('id' in createdSite) || !('name' in createdSite)) {
        this.presenter.stopLoading();
        this.presenter.presentError('Unexpected result type from site creation');
        return;
      }

      this.presenter.stopLoading();
      this.presenter.startLoading('Provisioning site resources...');

      const readyResult = await walde.site({ id: createdSite.id }).ready().resolve();

      this.presenter.stopLoading();

      if (readyResult.isOk()) {
        const readySite = readyResult.unwrap();
        if ('id' in readySite && 'name' in readySite) {
          this.presenter.presentSiteCreated(readySite);
        } else {
          this.presenter.presentError('Unexpected result type from site provisioning');
        }
      } else {
        this.presenter.presentProvisioningFailed();
      }
    } catch (error) {
      this.presenter.stopLoading();
      this.presenter.presentError(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}
