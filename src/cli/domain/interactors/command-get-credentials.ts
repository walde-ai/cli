import { MakeWaldeAdmin } from '@walde.ai/sdk';
import { CredentialsProvider } from '@walde.ai/sdk';
import { CredentialParser } from '@/cli/domain/ports/out/credential-parser';
import { ICredentialsPresenterV1 } from '@/cli/domain/ports/presenters/i-credentials-presenter-v1';

/**
 * CLI interactor for get credentials command
 */
export class CommandGetCredentials {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly credentialParser: CredentialParser,
    private readonly presenter: ICredentialsPresenterV1
  ) {}

  /**
   * Execute the get credentials command
   */
  async execute(): Promise<void> {
    const walde = MakeWaldeAdmin({
      credentialsProvider: this.credentialsProvider
    });

    const result = await walde.credentials().get().resolve();
    
    if (result.isOk()) {
      const credentials = result.unwrap();
      
      if (!credentials.isComplete()) {
        this.presenter.displayNoCredentials();
        return;
      }

      const parsedCredentials = await this.credentialParser.parse(credentials);
      this.presenter.displayCredentials(parsedCredentials);
    } else {
      this.presenter.displayNoCredentials();
    }
  }
}
