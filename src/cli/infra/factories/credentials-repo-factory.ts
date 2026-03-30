import * as path from 'path';
import * as os from 'os';
import { CredentialsFileRepo } from '@/cli/infra/repo/credentials-file-repo';
import { CredentialsRepo } from '@/cli/domain/ports/in/credentials-repo';
import { ICredentialsRepoFactory } from '@/cli/domain/ports/in/i-credentials-repo-factory';

type StageProvider = () => string | undefined;

/**
 * Factory for creating credentials repository.
 * Defers stage resolution to create() time so the --stage CLI option
 * is captured by the preAction hook before the file path is determined.
 */
export class CredentialsRepoFactory implements ICredentialsRepoFactory {
  constructor(private readonly stageProvider: StageProvider) {}

  /**
   * Create credentials repository using the current stage
   */
  public create(): CredentialsRepo {
    return new CredentialsFileRepo(() => {
      const stage = this.stageProvider();
      const homeDir = os.homedir();
      const waldeDir = path.join(homeDir, '.walde');

      const credentialsFileName = stage ? `credentials.${stage}.json` : 'credentials.json';
      return path.join(waldeDir, credentialsFileName);
    });
  }
}
