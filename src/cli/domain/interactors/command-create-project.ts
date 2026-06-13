import { MakeWaldeAdmin, CredentialsProvider } from '@walde.ai/sdk';
import { IProjectPresenter } from '@/cli/domain/ports/presenters/i-project-presenter';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { SiteSelector } from './site-selector';

export interface CreateProjectOptions {
  name?: string;
  siteId?: string;
  createSiteName?: string;
  createSiteRegion?: string;
}

/**
 * Command interactor for `walde project create`.
 *
 * Creates a new backend project and prints the created project ID and name.
 * No local workspace is created — users should run `walde init <project-id>`
 * separately to set up their local workspace.
 */
export class CommandCreateProject {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: IProjectPresenter,
    private readonly configLoader: ILoadConfig
  ) {}

  async execute(options: CreateProjectOptions): Promise<void> {
    const projectName = options.name || await this.presenter.requestProjectName();

    const config = await this.configLoader.execute();
    const walde = MakeWaldeAdmin({
      credentialsProvider: this.credentialsProvider,
      endpoint: config.settings.endpoint,
      clientId: config.settings.clientId,
      region: config.settings.region,
      s3ClientFactory: config.s3ClientFactory
    });

    const siteSelector = new SiteSelector(this.presenter);
    const siteId = await siteSelector.selectOrCreate(walde, {
      siteId: options.siteId,
      createSiteName: options.createSiteName,
      createSiteRegion: options.createSiteRegion,
    });

    this.presenter.startProjectCreation(projectName);
    let projectId: string;
    try {
      const createResult = await walde.api().call({
        method: 'POST',
        endpoint: '/v1/projects',
        data: {
          name: projectName,
          stages: [{ name: 'prod', siteId }],
        }
      }).resolve();

      if (createResult.isErr()) {
        throw new Error(`Failed to create project: ${createResult.unwrapErr()}`);
      }

      const project = createResult.unwrap() as { id: string };
      projectId = project.id;
    } finally {
      this.presenter.stopProjectCreation();
    }

    this.presenter.presentCreatedProject(projectId, projectName);
  }
}
