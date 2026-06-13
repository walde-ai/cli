import { MakeWaldeAdmin, CredentialsProvider, FileWorkspaceConfigRepo } from '@walde.ai/sdk';
import { IBriefPresenter } from '@/cli/domain/ports/presenters/i-brief-presenter';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';
import { UserError } from '@/cli/domain/exceptions';

export interface CreateBriefOptions {
  projectId?: string;
  title?: string;
  intent?: string;
  author?: string;
}

export class CommandBriefCreate {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: IBriefPresenter,
    private readonly configLoader: ILoadConfig
  ) {}

  async execute(options: CreateBriefOptions): Promise<void> {
    let projectId = options.projectId;

    if (!projectId) {
      const workspaceConfigRepo = new FileWorkspaceConfigRepo();
      const workspaceConfig = await workspaceConfigRepo.findWorkspace();
      if (workspaceConfig) {
        projectId = workspaceConfig.projectId;
      }
    }

    if (!projectId) {
      projectId = await this.presenter.requestProjectId();
    }

    const title = options.title || await this.presenter.requestBriefTitle();
    const intent = options.intent || await this.presenter.requestIntent();
    const author = options.author || 'user';

    const config = await this.configLoader.execute();
    const walde = MakeWaldeAdmin({
      credentialsProvider: this.credentialsProvider,
      endpoint: config.settings.endpoint,
      clientId: config.settings.clientId,
      region: config.settings.region,
      s3ClientFactory: config.s3ClientFactory
    });

    this.presenter.startOperation('Creating brief...');

    try {
      const result = await walde
        .brief({ id: '' })
        .create({ projectId, title, intent, author })
        .resolve();
      
      this.presenter.stopOperation();

      if (result.isErr()) {
        this.presenter.showError(result.unwrapErr());
        return;
      }

      const brief = result.unwrap();
      this.presenter.presentBriefCreated(brief);
    } catch (error: any) {
      this.presenter.stopOperation();
      this.presenter.showError(error.message || String(error));
    }
  }
}
