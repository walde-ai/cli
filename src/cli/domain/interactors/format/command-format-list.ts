import { MakeWaldeAdmin, CredentialsProvider, FileWorkspaceConfigRepo } from '@walde.ai/sdk';
import { IFormatPresenter, FormatListItem } from '@/cli/domain/ports/presenters/i-format-presenter';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { ResolveFormatProject } from './resolve-format-project';

export interface FormatListOptions {
  projectId?: string;
}

/**
 * Command interactor for `walde format list`.
 *
 * Lists the active project's custom post formats as a four-column table.
 * The native format never appears because the SDK list never returns it.
 */
export class CommandFormatList {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: IFormatPresenter,
    private readonly configLoader: ILoadConfig
  ) {}

  public async execute(options: FormatListOptions): Promise<void> {
    const projectId = await new ResolveFormatProject(new FileWorkspaceConfigRepo()).resolve(options.projectId);

    const config = await this.configLoader.execute();
    const walde = MakeWaldeAdmin({
      credentialsProvider: this.credentialsProvider,
      endpoint: config.settings.endpoint,
      clientId: config.settings.clientId,
      region: config.settings.region,
      s3ClientFactory: config.s3ClientFactory,
    });

    this.presenter.startFormatOperation('Listing formats...');

    try {
      const result = await walde.formats({ projectId }).list().resolve();

      this.presenter.stopFormatOperation();

      if (result.isErr()) {
        this.presenter.showError(String(result.unwrapErr()));
        return;
      }

      const items: FormatListItem[] = result.unwrap().map((format) => ({
        id: format.id,
        name: format.name,
        fieldCount: format.fields.length,
        updatedAt: format.updatedAt,
      }));
      this.presenter.presentFormats(items);
    } catch (error) {
      this.presenter.stopFormatOperation();
      this.presenter.showError(error instanceof Error ? error.message : String(error));
    }
  }
}
