import { MakeWaldeAdmin, CredentialsProvider, FileWorkspaceConfigRepo } from '@walde.ai/sdk';
import { IFormatPresenter } from '@/cli/domain/ports/presenters/i-format-presenter';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { ResolveFormatProject } from './resolve-format-project';

export interface FormatDeleteOptions {
  projectId?: string;
  confirm?: boolean;
}

/**
 * Command interactor for `walde format delete <formatId>`.
 *
 * Requests deletion after a confirmation prompt (unless `--confirm` is
 * passed) worded to state that the format definition is deleted and
 * existing posts are not. On the API's reference-protection 400 the
 * server's message is printed verbatim because that message — the count of
 * referencing posts and up to ten of their content ids — is the most
 * useful thing the CLI can show.
 */
export class CommandFormatDelete {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: IFormatPresenter,
    private readonly configLoader: ILoadConfig
  ) {}

  public async execute(formatId: string, options: FormatDeleteOptions): Promise<void> {
    const projectId = await new ResolveFormatProject(new FileWorkspaceConfigRepo()).resolve(options.projectId);

    const confirmed = options.confirm || await this.presenter.requestDeleteConfirmation(formatId);

    if (!confirmed) {
      this.presenter.presentDeletionCancelled();
      return;
    }

    const config = await this.configLoader.execute();
    const walde = MakeWaldeAdmin({
      credentialsProvider: this.credentialsProvider,
      endpoint: config.settings.endpoint,
      clientId: config.settings.clientId,
      region: config.settings.region,
      s3ClientFactory: config.s3ClientFactory,
    });

    this.presenter.startFormatOperation(`Deleting format ${formatId}...`);

    try {
      const result = await walde.formats({ projectId }).delete({ formatId }).resolve();

      this.presenter.stopFormatOperation();

      if (result.isErr()) {
        this.presenter.showError(String(result.unwrapErr()));
        return;
      }

      this.presenter.presentFormatDeleted(formatId);
    } catch (error) {
      this.presenter.stopFormatOperation();
      this.presenter.showError(error instanceof Error ? error.message : String(error));
    }
  }
}
