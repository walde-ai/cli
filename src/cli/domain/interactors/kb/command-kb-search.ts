import { MakeWaldeAdmin, CredentialsProvider, FileWorkspaceConfigRepo } from '@walde.ai/sdk';
import { IKnowledgeBasePresenter } from '@/cli/domain/ports/presenters/i-knowledge-base-presenter';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';

export interface SearchKnowledgeBaseOptions {
  query: string;
  projectId?: string;
  limit?: number;
}

const DEFAULT_LIMIT = 5;

/**
 * Searches the active project's Knowledge Base. Resolves the active project the
 * same way the other project-scoped commands do — from the `walde.json`
 * workspace marker — unless an explicit `--project` is supplied.
 */
export class CommandKbSearch {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: IKnowledgeBasePresenter,
    private readonly configLoader: ILoadConfig
  ) {}

  async execute(options: SearchKnowledgeBaseOptions): Promise<void> {
    let projectId = options.projectId;

    if (!projectId) {
      const workspaceConfigRepo = new FileWorkspaceConfigRepo();
      const workspaceConfig = await workspaceConfigRepo.findWorkspace();
      if (workspaceConfig) {
        projectId = workspaceConfig.projectId;
      }
    }

    if (!projectId) {
      this.presenter.showError('No project resolved. Run from a workspace directory or pass --project <projectId>.');
      return;
    }

    const limit = options.limit ?? DEFAULT_LIMIT;

    const config = await this.configLoader.execute();
    const walde = MakeWaldeAdmin({
      credentialsProvider: this.credentialsProvider,
      endpoint: config.settings.endpoint,
      clientId: config.settings.clientId,
      region: config.settings.region,
      s3ClientFactory: config.s3ClientFactory,
    });

    this.presenter.startOperation('Searching knowledge base...');

    try {
      const result = await walde
        .knowledgeBase({ projectId })
        .search({ query: options.query, limit })
        .resolve();

      this.presenter.stopOperation();

      if (result.isErr()) {
        this.presenter.showError(result.unwrapErr());
        return;
      }

      this.presenter.presentMatches(result.unwrap());
    } catch (error: any) {
      this.presenter.stopOperation();
      this.presenter.showError(error.message || String(error));
    }
  }
}
