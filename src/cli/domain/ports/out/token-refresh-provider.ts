import { Credentials } from '@/cli/domain/entities/credentials';

/**
 * Interface for refreshing authentication tokens
 */
export interface TokenRefreshProvider {
  /**
   * Refresh access and ID tokens using refresh token
   */
  refreshTokens(refreshToken: string): Promise<Credentials>;
}
