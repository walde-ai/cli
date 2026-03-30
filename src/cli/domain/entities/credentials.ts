/**
 * JWT payload structure with minimal required fields
 */
interface JwtPayload {
  exp?: number;
  [key: string]: unknown;
}

/**
 * Decode the payload of a JWT without verification
 * NOTE: Uses Node.js Buffer API - this file is only used in Node.js context (CLI)
 * @param token JWT token string
 * @returns Decoded payload or null if invalid
 */
function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // Decode base64url (replace URL-safe chars and add padding)
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - base64.length % 4) % 4);
    const base64WithPadding = base64 + padding;
    
    // Decode base64 to string (Buffer is Node.js only - acceptable since credentials are CLI-only)
    const jsonPayload = Buffer.from(base64WithPadding, 'base64').toString('utf-8');
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

/**
 * User authentication credentials
 */
export class Credentials {
  constructor(
    public readonly accessToken: string,
    public readonly refreshToken: string,
    public readonly idToken: string
  ) {}

  /**
   * Check if credentials are complete (at least access token is present)
   */
  public isComplete(): boolean {
    return !!this.accessToken;
  }

  /**
   * Returns time in milliseconds until idToken expires.
   * Returns 0 if expired or if expiry cannot be determined.
   */
  public timeToExpirationMs(): number {
    if (!this.idToken) {
      return 0;
    }

    const payload = decodeJwtPayload(this.idToken);
    if (!payload || typeof payload.exp !== 'number') {
      return 0;
    }

    const expiryTimeMs = payload.exp * 1000;
    const nowMs = Date.now();
    const timeToExpiry = expiryTimeMs - nowMs;

    return timeToExpiry > 0 ? timeToExpiry : 0;
  }
}
