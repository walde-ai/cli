import { Credentials } from '@/cli/domain/entities/credentials';

/**
 * Repository interface for user credentials
 */
export interface CredentialsRepo {
  /**
   * Retrieve user credentials
   */
  retrieve(): Promise<Credentials>;

  /**
   * Save user credentials
   */
  save(credentials: Credentials): Promise<void>;
}
