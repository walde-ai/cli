import * as path from 'path';
import * as os from 'os';
import { LoadConfig } from '@/cli/domain/interactors/load-config';
import { CredentialsFileRepo } from '@/cli/infra/repo/index';
import { WaldeAdminConfigFactory } from '@walde.ai/sdk';
import { getCurrentStage } from '../commands/common-options';

/**
 * Factory for creating configured LoadConfig interactor
 */
export class ConfigLoaderFactory {
  /**
   * Create LoadConfig interactor with SDK configuration
   */
  public static Create(): LoadConfig {
    const homeDir = os.homedir();
    const waldeDir = path.join(homeDir, '.walde');

    const credentialsRepos = [
      new CredentialsFileRepo(() => {
        const stage = getCurrentStage();
        const credentialsFileName = stage ? `credentials.${stage}.json` : 'credentials.json';
        return path.join(waldeDir, credentialsFileName);
      })
    ];

    return new LoadConfig(credentialsRepos);
  }
}
