import { WaldeAdminFactory, CredentialsProvider } from '@walde.ai/sdk';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { SystemError } from '@/cli/domain/exceptions';

export interface ApiCallParams {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  data?: any;
  headers?: Record<string, string>;
}

/**
 * Command interactor for API call operation
 */
export class CommandApiCall {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly configLoader: ILoadConfig
  ) {}

  async execute(params: ApiCallParams): Promise<any> {
    const config = await this.configLoader.execute();
    const walde = WaldeAdminFactory.createAdmin({ 
      credentialsProvider: this.credentialsProvider,
      endpoint: config.settings.endpoint,
      clientId: config.settings.clientId,
      region: config.settings.region,
      s3ClientFactory: config.s3ClientFactory
    });
    
    const result = await walde.api().call(params).resolve();

    if (result.isOk()) {
      return result.unwrap();
    } else {
      throw new SystemError(result.unwrapErr());
    }
  }
}
