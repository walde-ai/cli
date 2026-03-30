import { CredentialsProvider } from '@walde.ai/sdk';
import { Credentials } from '@/cli/domain/entities/credentials';

/**
 * Mock credentials provider for development mode
 * Returns valid JWT-formatted mock credentials
 */
export class MockCredentialsProvider implements CredentialsProvider {
  private static createMockJWT(): { accessToken: string; idToken: string; refreshToken: string } {
    const base64UrlEncode = (str: string): string => {
      return Buffer.from(str)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    };

    const now = Math.floor(Date.now() / 1000);
    const exp = now + 3600; // 1 hour from now

    // Access token
    const accessHeader = { alg: 'HS256', typ: 'JWT' };
    const accessPayload = {
      sub: 'dev-user-id',
      iss: 'http://localhost:3000/cognito',
      client_id: 'mock-client-id',
      origin_jti: 'mock-origin-jti',
      event_id: 'mock-event-id',
      token_use: 'access',
      scope: 'aws.cognito.signin.user.admin',
      jti: 'mock-access-jti',
      username: 'dev-user',
      exp: exp,
      iat: now,
      auth_time: now
    };

    // ID token
    const idHeader = { alg: 'HS256', typ: 'JWT' };
    const idPayload = {
      sub: 'dev-user-id',
      email_verified: true,
      iss: 'http://localhost:3000/cognito',
      'cognito:username': 'dev-user',
      origin_jti: 'mock-origin-jti',
      aud: 'mock-client-id',
      event_id: 'mock-event-id',
      token_use: 'id',
      jti: 'mock-id-jti',
      email: 'dev@example.com',
      exp: exp,
      iat: now,
      auth_time: now
    };

    const accessToken = base64UrlEncode(JSON.stringify(accessHeader)) + '.' +
                        base64UrlEncode(JSON.stringify(accessPayload)) + '.' +
                        'mock-signature';

    const idToken = base64UrlEncode(JSON.stringify(idHeader)) + '.' +
                    base64UrlEncode(JSON.stringify(idPayload)) + '.' +
                    'mock-signature';

    return { accessToken, idToken, refreshToken: 'mock-refresh-token' };
  }

  async retrieve(): Promise<Credentials> {
    const tokens = MockCredentialsProvider.createMockJWT();
    return new Credentials(
      tokens.accessToken,
      tokens.refreshToken,
      tokens.idToken
    );
  }

  async save(credentials: Credentials): Promise<void> {
    // No-op in dev mode
  }
}
