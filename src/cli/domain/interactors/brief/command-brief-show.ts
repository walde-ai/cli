import { MakeWaldeAdmin, CredentialsProvider } from '@walde.ai/sdk';
import { IBriefPresenter } from '@/cli/domain/ports/presenters/i-brief-presenter';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';

export interface ShowBriefOptions {
  briefId: string;
}

export class CommandBriefShow {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: IBriefPresenter,
    private readonly configLoader: ILoadConfig
  ) {}

  async execute(options: ShowBriefOptions): Promise<void> {
    const config = await this.configLoader.execute();
    const walde = MakeWaldeAdmin({
      credentialsProvider: this.credentialsProvider,
      endpoint: config.settings.endpoint,
      clientId: config.settings.clientId,
      region: config.settings.region,
      s3ClientFactory: config.s3ClientFactory
    });

    this.presenter.startOperation('Fetching brief...');

    try {
      const result = await walde.brief({ id: options.briefId }).resolve();
      
      this.presenter.stopOperation();

      if (result.isErr()) {
        this.presenter.showError(result.unwrapErr());
        return;
      }

      const brief = result.unwrap();
      this.presenter.presentBriefDetail(brief);
    } catch (error: any) {
      this.presenter.stopOperation();
      this.presenter.showError(error.message || String(error));
    }
  }
}
