import { MakeWaldeAdmin } from '@walde.ai/sdk';
import { CredentialsProvider } from '@walde.ai/sdk';

/**
 * CLI interactor for get token command
 */
export class CommandGetToken {
  constructor(private readonly credentialsProvider: CredentialsProvider) {}

  /**
   * Execute the get token command
   */
  async execute(): Promise<void> {
    const walde = MakeWaldeAdmin({
      credentialsProvider: this.credentialsProvider
    });

    const result = await walde.credentials().getToken().resolve();
    
    if (result.isOk()) {
      const token = result.unwrap();
      console.log(token);
    } else {
      process.exit(1);
    }
  }
}
