import { MakeWaldeAdmin, CredentialsProvider } from '@walde.ai/sdk';
import { IBriefPresenter } from '@/cli/domain/ports/presenters/i-brief-presenter';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';

export interface ListBriefsOptions {
  projectId?: string;
}

export class CommandBriefList {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: IBriefPresenter,
    private readonly configLoader: ILoadConfig
  ) {}

  async execute(options: ListBriefsOptions): Promise<void> {
    const config = await this.configLoader.execute();
    const walde = MakeWaldeAdmin({
      credentialsProvider: this.credentialsProvider,
      endpoint: config.settings.endpoint,
      clientId: config.settings.clientId,
      region: config.settings.region,
      s3ClientFactory: config.s3ClientFactory
    });

    this.presenter.startOperation('Fetching briefs...');

    try {
      let briefsFuture = walde.briefs();
      if (options.projectId) {
        briefsFuture = briefsFuture.forProject(options.projectId);
      }

      const result = await briefsFuture.resolve();
      
      this.presenter.stopOperation();

      if (result.isErr()) {
        this.presenter.showError(result.unwrapErr());
        return;
      }

      const envelopes = result.unwrap();
      const items = envelopes.map((env: { id: string; projectId: string; title: string; state: string; createdAt: string }) => ({
        id: env.id,
        projectId: env.projectId,
        title: env.title,
        state: env.state,
        createdAt: env.createdAt,
      }));

      this.presenter.presentBriefs(items);
    } catch (error: any) {
      this.presenter.stopOperation();
      this.presenter.showError(error.message || String(error));
    }
  }
}
