import { MakeWaldeAdmin, CredentialsProvider } from '@walde.ai/sdk';
import { IProjectPresenter, ProjectListItem } from '@/cli/domain/ports/presenters/i-project-presenter';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';

/**
 * Command interactor for `walde project list`.
 */
export class CommandProjectList {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: IProjectPresenter,
    private readonly configLoader: ILoadConfig
  ) {}

  async execute(): Promise<void> {
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
      endpoint: '/v1/projects'
    }).resolve();

    if (result.isErr()) {
      throw new Error(`Failed to list projects: ${result.unwrapErr()}`);
    }

    const response = result.unwrap() as { projects?: Array<ProjectListItem & { stages?: Array<{ name: string; siteId: string }> }> };
    const projects: ProjectListItem[] = (response.projects ?? []).map(p => ({
      id: p.id,
      name: p.name,
      state: p.state,
      stages: p.stages ?? [],
    }));
    this.presenter.presentProjects(projects);
  }
}
