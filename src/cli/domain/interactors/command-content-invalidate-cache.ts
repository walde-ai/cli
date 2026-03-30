import { WaldeAdminFactory, CredentialsProvider, FileWorkspaceConfigRepo } from '@walde.ai/sdk';
import { ICachePresenter } from '@/cli/domain/ports/presenters/i-cache-presenter';
import { ResolveSiteId } from '@/cli/domain/interactors/resolve-site-id';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { UserError } from '@/cli/domain/exceptions';

/**
 * Command interactor for content cache invalidation.
 */
export class CommandContentInvalidateCache {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: ICachePresenter,
    private readonly resolveSiteId: ResolveSiteId,
    private readonly configLoader: ILoadConfig
  ) {}

  async execute(options: { siteId?: string }): Promise<void> {
    const workspaceConfigRepo = new FileWorkspaceConfigRepo();
    const workspaceConfig = await workspaceConfigRepo.findWorkspace();
    const siteId = this.resolveSiteId.execute(options.siteId, workspaceConfig, true);

    if (!siteId) {
      throw new UserError('Site ID is required for cache invalidation');
    }

    this.presenter.startLoading('Invalidating rendered-content cache...');

    try {
      const config = await this.configLoader.execute();
      const walde = WaldeAdminFactory.createAdmin({
        credentialsProvider: this.credentialsProvider,
        endpoint: config.settings.endpoint,
        clientId: config.settings.clientId,
        region: config.settings.region,
        s3ClientFactory: config.s3ClientFactory
      });

      const result = await walde.site({ id: siteId })
        .invalidateCache()
        .resolve();

      this.presenter.stopLoading();

      if (result.isErr()) {
        this.presenter.showError(result.unwrapErr().message);
        return;
      } else {
        const { invalidationId } = result.unwrap();
        this.presenter.showInvalidated(invalidationId);
      }
    } catch (error) {
      this.presenter.stopLoading();
      throw error;
    }
  }
}
