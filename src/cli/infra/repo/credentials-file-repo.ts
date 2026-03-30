import * as fs from 'fs';
import * as path from 'path';
import { CredentialsRepo } from '@/cli/domain/ports/in/credentials-repo';
import { Credentials } from '@/cli/domain/entities/credentials';

type FilePathProvider = () => string;

/**
 * File-based repository for user credentials.
 * Accepts a path provider function to defer path resolution,
 * allowing the --stage CLI option to be captured before the file path is determined.
 */
export class CredentialsFileRepo implements CredentialsRepo {
  constructor(private readonly filePathProvider: FilePathProvider) {}

  /**
   * Retrieve user credentials from JSON file
   */
  public async retrieve(): Promise<Credentials> {
    try {
      const filePath = this.filePathProvider();
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      
      return new Credentials(
        data.accessToken,
        data.refreshToken,
        data.idToken
      );
    } catch (error: any) {
      return new Credentials('', '', '');
    }
  }

  /**
   * Save user credentials to JSON file
   */
  public async save(credentials: Credentials): Promise<void> {
    const filePath = this.filePathProvider();
    const data = {
      accessToken: credentials.accessToken,
      refreshToken: credentials.refreshToken,
      idToken: credentials.idToken
    };

    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }
}
