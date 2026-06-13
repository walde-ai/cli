import { CredentialsRepo } from '@/cli/domain/ports/in/credentials-repo';
import { Config } from '@/cli/domain/entities/Config';
import { Credentials } from '@/cli/domain/entities/credentials';
import { WaldeAdminConfigFactory } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { getCurrentStage } from '@/cli/infra/commands/common-options';

/**
 * Interactor for loading configuration from SDK and credentials from repositories
 */
export class LoadConfig implements ILoadConfig {
  constructor(
    private readonly credentialsRepos: CredentialsRepo[],
    private readonly endpointOverride?: string
  ) {}

  /**
   * Execute configuration loading using SDK factory and credential repositories
   * @param stage - Optional stage parameter (alpha, beta, gamma, prod, local). If not provided, uses current stage from command options.
   */
  public async execute(stage?: string): Promise<Config> {
    const effectiveStage = stage !== undefined ? stage : getCurrentStage();
    const providedConfig = this.endpointOverride ? { endpoint: this.endpointOverride } : {};
    const settings = WaldeAdminConfigFactory.create(providedConfig, effectiveStage);
    const credentials = await this.loadCredentials();
    
    return new Config(settings, credentials);
  }

  /**
   * Load credentials from repositories - return first complete credentials found
   */
  private async loadCredentials(): Promise<Credentials | undefined> {
    for (const repo of this.credentialsRepos) {
      const credentials = await repo.retrieve();
      
      if (credentials.isComplete()) {
        return credentials;
      }
    }

    return undefined;
  }
}
