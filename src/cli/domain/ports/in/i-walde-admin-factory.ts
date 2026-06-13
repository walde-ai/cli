import { CredentialsProvider, WaldeAdmin } from '@walde.ai/sdk';

export interface WaldeAdminCreateParams {
  credentialsProvider: CredentialsProvider;
  endpoint: string;
  clientId: string;
  region: string;
}

/**
 * Port interface for creating WaldeAdmin instances.
 * Abstracts the concrete SDK factory to enable dependency injection.
 */
export interface IWaldeAdminFactory {
  create(params: WaldeAdminCreateParams): WaldeAdmin;
}
