import { MakeWaldeAdmin, CredentialsProvider, FileWorkspaceConfigRepo, ProjectWorkspaceConfig } from '@walde.ai/sdk';
import { ICachePresenter } from '@/cli/domain/ports/presenters/i-cache-presenter';
import { ResolveTarget } from '@/cli/domain/interactors/resolve-target';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { UserError } from '@/cli/domain/exceptions';

/**
 * Command interactor for unified cache invalidation.
 */
export class CommandCacheInvalidate {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: ICachePresenter,
    private readonly resolveTarget: ResolveTarget,
    private readonly configLoader: ILoadConfig
  ) {}

  async execute(options: { siteId?: string; target?: string }): Promise<void> {
    let workspaceConfig: ProjectWorkspaceConfig | undefined;

    if (!options.siteId) {
      const workspaceConfigRepo = new FileWorkspaceConfigRepo();
      const found = await workspaceConfigRepo.findWorkspace();
      if (!found) {
        throw new UserError('No workspace detected and no --site-id provided. Either run from a workspace directory or specify --site-id option.');
      }
      workspaceConfig = found;
    }

    const { siteId } = await this.resolveTarget.execute({
      siteIdOption: options.siteId,
      targetOption: options.target,
      workspaceConfig
    });

    this.presenter.startLoading('Invalidating cache...');

    try {
      const config = await this.configLoader.execute();
      const walde = MakeWaldeAdmin({
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
      }

      const { invalidationId } = result.unwrap();
      this.presenter.showInvalidated(invalidationId);
    } catch (error) {
      this.presenter.stopLoading();
      throw error;
    }
  }
}
