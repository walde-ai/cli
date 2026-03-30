import { WaldeAdminConfigData, S3ClientFactory } from '@walde.ai/sdk';
import { Credentials } from './credentials';

/**
 * Main configuration object containing settings and credentials
 */
export class Config {
  constructor(
    public readonly settings: WaldeAdminConfigData,
    public readonly credentials?: Credentials,
    public readonly s3ClientFactory?: S3ClientFactory
  ) {}
}
