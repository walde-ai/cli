import { CredentialParser, ParsedCredentials } from '@/cli/domain/ports/out/credential-parser';
import { Credentials } from '@/cli/domain/entities/credentials';

/**
 * JWT implementation of CredentialParser
 */
export class JWTCredentialParser implements CredentialParser {
  /**
   * Parse JWT credentials and return key-value pairs
   */
  public async parse(credentials: Credentials): Promise<ParsedCredentials> {
    const result: ParsedCredentials = {};

    // Parse access token
    if (credentials.accessToken) {
      const accessTokenData = this.parseJWT(credentials.accessToken);
      Object.keys(accessTokenData).forEach(key => {
        result[`access_${key}`] = accessTokenData[key];
      });
    }

    // Parse ID token
    if (credentials.idToken) {
      const idTokenData = this.parseJWT(credentials.idToken);
      Object.keys(idTokenData).forEach(key => {
        result[`id_${key}`] = idTokenData[key];
      });
    }

    // Add refresh token info (not JWT, just metadata)
    if (credentials.refreshToken) {
      result['refresh_token_present'] = true;
      result['refresh_token_length'] = credentials.refreshToken.length;

      // Extract creation time from access token if available
      if (credentials.accessToken) {
        const accessTokenData = this.parseJWT(credentials.accessToken);
        if (accessTokenData.iat_readable) {
          // Refresh token was likely issued at the same time as access token
          result['refresh_token_issued_at'] = accessTokenData.iat_readable;
        }
        if (accessTokenData.auth_time_readable) {
          // Authentication time when refresh token was created
          result['refresh_token_auth_time'] = accessTokenData.auth_time_readable;
        }
      }

      // Cognito refresh tokens typically last 30 days by default, but this is configurable
      // We derive the expiration from the access token issue time
      if (result['refresh_token_issued_at']) {
        const issuedAt = new Date(result['refresh_token_issued_at'] as string);
        const expiry = new Date(issuedAt.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days
        result['refresh_token_expiry'] = expiry.toISOString();
      }
    }

    return result;
  }

  /**
   * Parse JWT token and extract payload
   */
  private parseJWT(token: string): Record<string, any> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { error: 'Invalid JWT format' };
      }

      const payload = parts[1];
      const decoded = Buffer.from(payload, 'base64').toString('utf-8');
      const parsed = JSON.parse(decoded);

      // Convert timestamps to readable dates and remove raw timestamps
      if (parsed.exp) {
        parsed.exp_readable = new Date(parsed.exp * 1000).toISOString();
        delete parsed.exp;
      }
      if (parsed.iat) {
        parsed.iat_readable = new Date(parsed.iat * 1000).toISOString();
        delete parsed.iat;
      }
      if (parsed.auth_time) {
        parsed.auth_time_readable = new Date(parsed.auth_time * 1000).toISOString();
        delete parsed.auth_time;
      }

      return parsed;
    } catch (error) {
      return { error: 'Failed to parse JWT' };
    }
  }
}
