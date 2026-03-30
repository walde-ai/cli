import { CredentialsRepo } from '@/cli/domain/ports/in/credentials-repo';
import { UserError } from '@/cli/domain/exceptions';

/**
 * Interactor for retrieving ID token
 */
export class GetToken {
  constructor(private readonly credentialsRepo: CredentialsRepo) {}

  /**
   * Get the ID token from stored credentials
   */
  public async execute(): Promise<string> {
    const credentials = await this.credentialsRepo.retrieve();
    
    if (!credentials.idToken) {
      throw new UserError('No ID token found. Please login first.');
    }

    return credentials.idToken;
  }
}
