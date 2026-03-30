import { Credentials } from '@/cli/domain/entities/credentials';

/**
 * Parsed credential data as key-value pairs
 */
export type ParsedCredentials = Record<string, string | number | boolean>;

/**
 * Interface for parsing credentials
 */
export interface CredentialParser {
  /**
   * Parse credentials and return key-value pairs
   */
  parse(credentials: Credentials): Promise<ParsedCredentials>;
}
