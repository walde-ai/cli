import { MakeWaldeAdmin, CredentialsProvider } from '@walde.ai/sdk';

import { IProjectPresenter } from '@/cli/domain/ports/presenters/i-project-presenter';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';

export interface DeleteProjectOptions {
  confirm?: boolean;
}

/**
 * Command interactor for `walde project delete <project-id>`.
 *
 * Requests deletion of a project and all its associated resources after
 * prompting for confirmation (unless `--confirm` is passed).
 */
export class CommandProjectDelete {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: IProjectPresenter,
    private readonly configLoader: ILoadConfig
  ) {}

  async execute(projectId: string, options: DeleteProjectOptions): Promise<void> {
    const confirmed = options.confirm || await this.presenter.requestDeleteConfirmation(projectId);

    if (!confirmed) {
      this.presenter.presentDeletionCancelled();
      return;
    }

    this.presenter.startProjectDeletion(projectId);

    try {
      const config = await this.configLoader.execute();
      const walde = MakeWaldeAdmin({
        credentialsProvider: this.credentialsProvider,
        endpoint: config.settings.endpoint,
        clientId: config.settings.clientId,
        region: config.settings.region,
        s3ClientFactory: config.s3ClientFactory
      });

      const deleteResult = await walde.api().call({
        method: 'DELETE',
        endpoint: `/v1/projects/${projectId}`,
      }).resolve();

      this.presenter.stopProjectDeletion();

      if (deleteResult.isErr()) {
        this.presenter.presentProjectDeletionError(String(deleteResult.unwrapErr()));
        return;
      }

      this.presenter.presentProjectDeleted(projectId);
    } catch (error) {
      this.presenter.stopProjectDeletion();
      this.presenter.presentProjectDeletionError(error instanceof Error ? error.message : 'Unknown error');
    }
  }
}
