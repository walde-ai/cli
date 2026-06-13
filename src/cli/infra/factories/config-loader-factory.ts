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
   * Optional override for the API endpoint. Set once at the CLI
   * composition root from `WALDE_API_ENDPOINT` and used as the highest
   * priority configuration layer when loading the SDK config.
   */
  private static endpointOverride: string | undefined;

  /**
   * Set the endpoint override read from the environment at startup.
   * Intended to be called exactly once from the CLI entry point.
   */
  public static setEndpointOverride(endpoint: string | undefined): void {
    this.endpointOverride = endpoint;
  }

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

    return new LoadConfig(credentialsRepos, this.endpointOverride);
  }
}
