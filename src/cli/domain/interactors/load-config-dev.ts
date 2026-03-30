import { Config } from '@/cli/domain/entities/Config';
import { Credentials } from '@/cli/domain/entities/credentials';
import { WaldeAdminConfigFactory, S3ClientFactory } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { getCurrentStage } from '@/cli/infra/commands/common-options';

/**
 * Development configuration for mock server endpoint
 */
export interface DevConfig {
  endpoint: string;
  s3Endpoint: string;
  s3ClientFactory?: S3ClientFactory;
}

/**
 * Interactor for loading configuration in development mode
 * Loads clientId, region, userPoolId from config files like production
 * Only overrides endpoint with mock server
 */
export class LoadConfigDev implements ILoadConfig {
  constructor(private readonly devConfig: DevConfig) {}
  
  /**
   * Execute configuration loading using config files with mock endpoint override
   * @param stage - Optional stage parameter (defaults to 'local' for dev mode). If not provided, uses current stage from command options or 'local'.
   */
  public async execute(stage?: string): Promise<Config> {
    const effectiveStage = stage !== undefined ? stage : (getCurrentStage() || 'local');
    const baseSettings = WaldeAdminConfigFactory.create({}, effectiveStage);
    
    const settings = {
      ...baseSettings,
      endpoint: this.devConfig.endpoint
    };
    
    const credentials = new Credentials(
      'dev-access-token',
      'dev-refresh-token',
      'dev-id-token'
    );
    
    return new Config(settings, credentials, this.devConfig.s3ClientFactory);
  }
}
