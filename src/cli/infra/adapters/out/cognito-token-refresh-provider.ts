import { CognitoIdentityProviderClient, InitiateAuthCommand } from '@aws-sdk/client-cognito-identity-provider';
import { TokenRefreshProvider } from '@/cli/domain/ports/out/token-refresh-provider';
import { Credentials } from '@/cli/domain/entities/credentials';

/**
 * Cognito implementation of TokenRefreshProvider
 */
export class CognitoTokenRefreshProvider implements TokenRefreshProvider {
  private readonly client: CognitoIdentityProviderClient;

  constructor(
    private readonly clientId: string,
    private readonly region: string = 'eu-central-1'
  ) {
    this.client = new CognitoIdentityProviderClient({ region: this.region });
  }

  /**
   * Refresh access and ID tokens using refresh token
   */
  public async refreshTokens(refreshToken: string): Promise<Credentials> {
    try {
      const command = new InitiateAuthCommand({
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: this.clientId,
        AuthParameters: {
          REFRESH_TOKEN: refreshToken
        }
      });

      const response = await this.client.send(command);

      if (!response.AuthenticationResult) {
        throw new Error('No authentication result received from Cognito');
      }

      const { AccessToken, IdToken, RefreshToken } = response.AuthenticationResult;

      if (!AccessToken || !IdToken) {
        throw new Error('Missing tokens in refresh response');
      }

      return new Credentials(
        AccessToken,                    // accessToken ✅
        RefreshToken || refreshToken,   // refreshToken ✅
        IdToken                         // idToken ✅
      );

    } catch (error: any) {
      if (error.name === 'NotAuthorizedException') {
        throw new Error('Refresh token has expired. Please login again.');
      }
      throw new Error(`Failed to refresh tokens: ${error.message}`);
    }
  }
}
