import { MakeWaldeAdmin, CredentialsProvider } from '@walde.ai/sdk';
import { IProjectRepository } from '@/cli/domain/interactors/resolve-target';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';

/**
 * Project repository adapter that fetches project data via the SDK API
 */
export class ApiProjectRepository implements IProjectRepository {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly configLoader: ILoadConfig
  ) {}

  async get(projectId: string): Promise<{ id: string; name: string; state: string; repositoryUrl: string; stages: Array<{ name: string; siteId: string }> }> {
    const config = await this.configLoader.execute();
    const walde = MakeWaldeAdmin({
      credentialsProvider: this.credentialsProvider,
      endpoint: config.settings.endpoint,
      clientId: config.settings.clientId,
      region: config.settings.region,
      s3ClientFactory: config.s3ClientFactory
    });

    const result = await walde.api().call({
      method: 'GET',
      endpoint: `/v1/projects/${projectId}`
    }).resolve();

    if (result.isErr()) {
      throw new Error(`Failed to load project: ${result.unwrapErr()}`);
    }

    const project = result.unwrap() as { id: string; name: string; state: string; repositoryUrl?: string; stages: Array<{ name: string; siteId: string }> };
    return {
      id: project.id,
      name: project.name,
      state: project.state,
      repositoryUrl: project.repositoryUrl ?? '',
      stages: project.stages,
    };
  }
}
