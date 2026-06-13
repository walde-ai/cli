import { MakeWaldeAdmin, CredentialsProvider } from '@walde.ai/sdk';
import { IBriefPresenter } from '@/cli/domain/ports/presenters/i-brief-presenter';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';

export interface ImplementOptions {
  briefId: string;
  author?: string;
}

export class CommandBriefImplement {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: IBriefPresenter,
    private readonly configLoader: ILoadConfig
  ) {}

  async execute(options: ImplementOptions): Promise<void> {
    const author = options.author || 'user';

    const config = await this.configLoader.execute();
    const walde = MakeWaldeAdmin({
      credentialsProvider: this.credentialsProvider,
      endpoint: config.settings.endpoint,
      clientId: config.settings.clientId,
      region: config.settings.region,
      s3ClientFactory: config.s3ClientFactory
    });

    this.presenter.startOperation('Marking brief as implementing...');

    try {
      const result = await walde
        .brief({ id: options.briefId })
        .implement({ author })
        .resolve();
      
      this.presenter.stopOperation();

      if (result.isErr()) {
        this.presenter.showError(result.unwrapErr());
        return;
      }

      const brief = result.unwrap();
      this.presenter.presentBriefUpdated(brief);
    } catch (error: any) {
      this.presenter.stopOperation();
      this.presenter.showError(error.message || String(error));
    }
  }
}
