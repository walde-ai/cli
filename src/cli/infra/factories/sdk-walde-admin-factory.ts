import { WaldeAdmin, MakeWaldeAdmin } from '@walde.ai/sdk';

import { IWaldeAdminFactory, WaldeAdminCreateParams } from '@/cli/domain/ports/in/i-walde-admin-factory';

/**
 * Concrete implementation of IWaldeAdminFactory that delegates to the SDK MakeWaldeAdmin
 */
export class SdkWaldeAdminFactory implements IWaldeAdminFactory {
  create(params: WaldeAdminCreateParams): WaldeAdmin {
    return MakeWaldeAdmin({
      credentialsProvider: params.credentialsProvider,
      endpoint: params.endpoint,
      clientId: params.clientId,
      region: params.region,
    });
  }
}
