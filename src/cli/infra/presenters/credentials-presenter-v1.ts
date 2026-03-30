import { ICredentialsPresenterV1 } from '@/cli/domain/ports/presenters/i-credentials-presenter-v1';
import { ParsedCredentials } from '@/cli/domain/ports/out/credential-parser';
import { ISpinnerComponent } from '@/cli/domain/ports/presenters/components/i-spinner-component';
import { CliTheme } from './cli-theme';

/**
 * Credentials presenter implementation using component composition
 */
export class CredentialsPresenterV1 implements ICredentialsPresenterV1 {
  private spinner: ISpinnerComponent;

  constructor(spinner: ISpinnerComponent) {
    this.spinner = spinner;
  }

  /**
   * Display parsed credentials to user
   */
  public displayCredentials(parsedCredentials: ParsedCredentials): void {
    // Group by token type
    const accessTokenData: Record<string, any> = {};
    const idTokenData: Record<string, any> = {};
    const otherData: Record<string, any> = {};

    Object.entries(parsedCredentials).forEach(([key, value]) => {
      if (key.startsWith('access_')) {
        accessTokenData[key.replace('access_', '')] = value;
      } else if (key.startsWith('id_')) {
        idTokenData[key.replace('id_', '')] = value;
      } else {
        otherData[key] = value;
      }
    });

    // Display access token data
    if (Object.keys(accessTokenData).length > 0) {
      const expirationStatus = this.getExpirationStatus(accessTokenData.exp_readable);
      console.log(CliTheme.accent.bold('Access Token') + ' ' + expirationStatus);
      this.displayTokenData(accessTokenData);
      console.log();
    }

    // Display ID token data
    if (Object.keys(idTokenData).length > 0) {
      const expirationStatus = this.getExpirationStatus(idTokenData.exp_readable);
      console.log(CliTheme.accent.bold('ID Token') + ' ' + expirationStatus);
      this.displayTokenData(idTokenData);
      console.log();
    }

    // Display other data (refresh token)
    if (Object.keys(otherData).length > 0) {
      const refreshExpirationStatus = this.getRefreshTokenStatus(otherData);
      console.log(CliTheme.accent.bold('Refresh Token') + ' ' + refreshExpirationStatus);
      this.displayRefreshTokenData(otherData);
    }
  }

  /**
   * Display error when no credentials found
   */
  public displayNoCredentials(): void {
    console.log(CliTheme.error('✗ No credentials found'));
    console.log(CliTheme.soft('Run'), CliTheme.accent('"walde login"'), CliTheme.soft('to authenticate'));
  }

  /**
   * Start loading indicator for refresh operation
   */
  public startRefreshLoading(): void {
    this.spinner.start('Refreshing authentication tokens...');
  }

  /**
   * Stop loading and show success message for refresh
   */
  public showRefreshSuccess(): void {
    this.spinner.stop();
    console.log(CliTheme.accent('✓ Tokens refreshed successfully'));
  }

  /**
   * Stop loading and show error message for refresh
   */
  public showRefreshError(errorMessage: string): void {
    this.spinner.stop();
    console.error(CliTheme.error(`✗ ${errorMessage}`));

    if (errorMessage.includes('refresh token has expired') ||
        errorMessage.includes('Please login again')) {
      console.log(CliTheme.soft('Run "walde login" to authenticate with fresh credentials'));
    }
  }

  /**
   * Get expiration status with formatted time
   */
  private getExpirationStatus(expReadable?: string): string {
    if (!expReadable || typeof expReadable !== 'string') {
      return '';
    }

    const expDate = new Date(expReadable);
    const now = new Date();
    const timeLeft = Math.floor((expDate.getTime() - now.getTime()) / 1000);

    if (timeLeft <= 0) {
      return CliTheme.error('(Expired)');
    }

    const timeString = this.formatTimeRemaining(timeLeft);
    return CliTheme.accent(`(Expiring in ${timeString})`);
  }

  /**
   * Get refresh token expiration status
   */
  private getRefreshTokenStatus(refreshData: Record<string, any>): string {
    const expiry = refreshData.refresh_token_expiry;
    if (!expiry || typeof expiry !== 'string') {
      return '';
    }

    const expDate = new Date(expiry);
    const now = new Date();
    const timeLeft = Math.floor((expDate.getTime() - now.getTime()) / 1000);

    if (timeLeft <= 0) {
      return CliTheme.error('(Expired)');
    }

    const timeString = this.formatTimeRemaining(timeLeft);
    return CliTheme.accent(`(Expiring in ${timeString})`);
  }

  /**
   * Display refresh token data with special formatting
   */
  private displayRefreshTokenData(data: Record<string, any>): void {
    // Define display order and custom formatting for refresh token fields
    const fieldOrder = [
      'refresh_token_type',
      'refresh_token_note',
      'refresh_token_present',
      'refresh_token_length',
      'refresh_token_issued_at',
      'refresh_token_auth_time',
      'refresh_token_expiry'
    ];

    fieldOrder.forEach(key => {
      if (data[key] !== undefined) {
        const formattedKey = this.formatRefreshTokenKey(key);
        const formattedValue = this.formatRefreshTokenValue(key, data[key]);
        console.log(`  ${CliTheme.accent('•')} ${CliTheme.soft(formattedKey)}: ${formattedValue}`);
      }
    });

    // Display any remaining fields not in the ordered list
    Object.entries(data).forEach(([key, value]) => {
      if (!fieldOrder.includes(key)) {
        const formattedKey = this.formatKey(key);
        const formattedValue = this.formatValue(value);
        console.log(`  ${CliTheme.accent('•')} ${CliTheme.soft(formattedKey)}: ${formattedValue}`);
      }
    });
  }

  /**
   * Format refresh token specific keys
   */
  private formatRefreshTokenKey(key: string): string {
    const keyMap: Record<string, string> = {
      'refresh_token_type': 'Type',
      'refresh_token_note': 'Purpose',
      'refresh_token_present': 'Available',
      'refresh_token_length': 'Token Length',
      'refresh_token_issued_at': 'Issued At',
      'refresh_token_auth_time': 'Authentication Time',
      'refresh_token_expiry': 'Expires'
    };

    return keyMap[key] || this.formatKey(key);
  }

  /**
   * Format refresh token specific values
   */
  private formatRefreshTokenValue(key: string, value: any): string {
    switch (key) {
      case 'refresh_token_present':
        return value ? CliTheme.accent('✓ Yes') : CliTheme.error('✗ No');

      case 'refresh_token_length':
        return CliTheme.body(`${value} characters`);

      case 'refresh_token_type':
        return CliTheme.accent(value);

      case 'refresh_token_note':
        return CliTheme.soft(value);

      case 'refresh_token_issued_at':
      case 'refresh_token_auth_time':
        return CliTheme.soft(value) + CliTheme.soft(` (${this.getRelativeTime(value)})`);

      case 'refresh_token_expiry':
        const expDate = new Date(value);
        const now = new Date();
        const isExpired = expDate.getTime() <= now.getTime();
        const color = isExpired ? CliTheme.error : CliTheme.soft;
        const relativeTime = this.getRelativeTime(value);
        return color(value) + CliTheme.soft(` (${relativeTime})`);

      default:
        return this.formatValue(value);
    }
  }

  /**
   * Get relative time description (e.g., "2 hours ago", "in 5 days")
   */
  private getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
    const absDiffSeconds = Math.abs(diffSeconds);

    if (absDiffSeconds < 60) {
      return diffSeconds > 0 ? 'in a few seconds' : 'a few seconds ago';
    }

    const diffMinutes = Math.floor(absDiffSeconds / 60);
    if (diffMinutes < 60) {
      return diffSeconds > 0 ? `in ${diffMinutes}m` : `${diffMinutes}m ago`;
    }

    const diffHours = Math.floor(absDiffSeconds / 3600);
    if (diffHours < 24) {
      return diffSeconds > 0 ? `in ${diffHours}h` : `${diffHours}h ago`;
    }

    const diffDays = Math.floor(absDiffSeconds / 86400);
    return diffSeconds > 0 ? `in ${diffDays}d` : `${diffDays}d ago`;
  }

  /**
   * Format time remaining in human readable format
   */
  private formatTimeRemaining(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const parts: string[] = [];

    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (secs > 0 && parts.length === 0) parts.push(`${secs}s`);

    return parts.join(' ') || '0s';
  }

  /**
   * Display token data in formatted way
   */
  private displayTokenData(data: Record<string, any>): void {
    Object.entries(data).forEach(([key, value]) => {
      const formattedKey = this.formatKey(key);
      const formattedValue = this.formatValue(value);

      console.log(`  ${CliTheme.accent('•')} ${CliTheme.soft(formattedKey)}: ${formattedValue}`);
    });
  }

  /**
   * Format key for display
   */
  private formatKey(key: string): string {
    return key
      .replace(/_readable/g, '') // Remove _readable suffix
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/Jti/g, 'JTI')
      .replace(/Iss/g, 'Issuer')
      .replace(/Sub/g, 'Subject')
      .replace(/Aud/g, 'Audience')
      .replace(/Exp/g, 'Expires')
      .replace(/Iat/g, 'Issued At');
  }

  /**
   * Format value for display
   */
  private formatValue(value: any): string {
    if (typeof value === 'boolean') {
      return value ? CliTheme.accent('✓') : CliTheme.error('✗');
    }

    if (typeof value === 'number') {
      return CliTheme.body(value.toString());
    }

    if (typeof value === 'string') {
      // Handle URLs
      if (value.startsWith('http')) {
        return CliTheme.accent(value.length > 50 ? value.substring(0, 47) + '...' : value);
      }

      // Handle email addresses
      if (value.includes('@')) {
        return CliTheme.accent(value);
      }

      // Handle timestamps
      if (value.includes('T') && value.includes('Z')) {
        return CliTheme.soft(value);
      }

      // Handle long strings
      if (value.length > 50) {
        return CliTheme.soft(value.substring(0, 47) + '...');
      }

      return CliTheme.body(value);
    }

    return CliTheme.body(String(value));
  }
}
