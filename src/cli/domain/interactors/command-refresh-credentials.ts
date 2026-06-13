import { MakeWaldeAdmin } from '@walde.ai/sdk';
import { CredentialsProvider } from '@walde.ai/sdk';
import { ICredentialsPresenterV1 } from '@/cli/domain/ports/presenters/i-credentials-presenter-v1';

/**
 * CLI interactor for refresh credentials command
 */
export class CommandRefreshCredentials {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: ICredentialsPresenterV1,
    private readonly clientId: string,
    private readonly region?: string,
    private readonly endpoint?: string
  ) {}

  /**
   * Execute the refresh credentials command
   */
  async execute(): Promise<void> {
    const walde = MakeWaldeAdmin({
      credentialsProvider: this.credentialsProvider,
      clientId: this.clientId,
      region: this.region,
      endpoint: this.endpoint
    });

    try {
      this.presenter.startRefreshLoading();
      
      const result = await walde.credentials().refresh().resolve();
      
      if (result.isOk()) {
        this.presenter.showRefreshSuccess();
      } else {
        this.presenter.showRefreshError(`Failed to refresh tokens: ${result.error}`);
        process.exit(1);
      }
    } catch (error: any) {
      this.presenter.showRefreshError(`Failed to refresh tokens: ${error.message}`);
      process.exit(1);
    }
  }
}
