import { WaldeAdminFactory, CredentialsProvider } from '@walde.ai/sdk';
import { IWorkspacePresenter } from '@/cli/domain/ports/presenters/i-workspace-presenter';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';

export interface WorkspaceInitOptions {
  targetPath?: string;
  siteId?: string;
  createSiteName?: string;
  createSiteRegion?: string;
  stage?: string;
}

/**
 * Command interactor for workspace initialization
 */
export class CommandWorkspaceInit {
  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: IWorkspacePresenter,
    private readonly configLoader: ILoadConfig
  ) {}

  async execute(options: WorkspaceInitOptions): Promise<void> {
    try {
      const { siteId, createSiteName, createSiteRegion } = options;
      const workspacePath = options.targetPath || await this.presenter.requestPath();
      
      let finalSiteId: string;

      if (siteId) {
        finalSiteId = siteId;
      } else if (createSiteName !== undefined) {
        const region = createSiteRegion || await this.presenter.requestNewSiteRegion();
        // Create new site first
        const config = await this.configLoader.execute();
        const walde = WaldeAdminFactory.createAdmin({ 
          credentialsProvider: this.credentialsProvider,
          endpoint: config.settings.endpoint,
          clientId: config.settings.clientId,
          region: config.settings.region,
          s3ClientFactory: config.s3ClientFactory
        });

        this.presenter.startSiteCreation(createSiteName);
        const createResult = await walde.sites().create({ name: createSiteName, region }).resolve();
        if (createResult.isErr()) {
          this.presenter.showSiteCreationError(createResult.unwrapErr());
          throw new Error(`Failed to create site: ${createResult.unwrapErr()}`);
        }
        
        const siteResult = createResult.unwrap();
        if ('id' in siteResult && 'name' in siteResult) {
          this.presenter.showSiteCreated(siteResult);
          finalSiteId = siteResult.id!;
        } else {
          throw new Error('Unexpected result type from site creation');
        }
      } else {
        // Interactive flow - get sites and let user choose
        const config = await this.configLoader.execute();
        const walde = WaldeAdminFactory.createAdmin({ 
          credentialsProvider: this.credentialsProvider,
          endpoint: config.settings.endpoint,
          clientId: config.settings.clientId,
          region: config.settings.region,
          s3ClientFactory: config.s3ClientFactory
        });

        const sitesResult = await walde.sites().list().resolve();
        if (sitesResult.isErr()) {
          throw new Error(`Failed to load sites: ${sitesResult.unwrapErr()}`);
        }

        const sites = sitesResult.unwrap();
        const selection = await this.presenter.requestSiteSelection(sites);

        if (selection === 'CREATE_NEW') {
          const newName = await this.presenter.requestNewSiteName();
          const newRegion = await this.presenter.requestNewSiteRegion();
          this.presenter.startSiteCreation(newName);
          const createResult = await walde.sites().create({ name: newName, region: newRegion }).resolve();
          if (createResult.isErr()) {
            this.presenter.showSiteCreationError(createResult.unwrapErr());
            throw new Error(`Failed to create site: ${createResult.unwrapErr()}`);
          }
          
          const siteResult = createResult.unwrap();
          if ('id' in siteResult && 'name' in siteResult) {
            this.presenter.showSiteCreated(siteResult);
            finalSiteId = siteResult.id!;
          } else {
            throw new Error('Unexpected result type from site creation');
          }
        } else {
          finalSiteId = selection;
        }
      }

      // Confirm initialization
      const shouldProceed = await this.presenter.confirmInit(workspacePath, finalSiteId);
      if (!shouldProceed) {
        console.log('Workspace initialization cancelled.');
        return;
      }

      // Initialize workspace using SDK
      const config = await this.configLoader.execute();
      const walde = WaldeAdminFactory.createAdmin({ 
        credentialsProvider: this.credentialsProvider,
        endpoint: config.settings.endpoint,
        clientId: config.settings.clientId,
        region: config.settings.region,
        s3ClientFactory: config.s3ClientFactory
      });

      const result = await walde.workspace().init({
        targetPath: workspacePath,
        siteId: finalSiteId,
        stage: options.stage
      }).resolve();

      if (result.isOk()) {
        console.log('✓ Workspace initialized successfully!');
      } else {
        throw new Error(result.unwrapErr());
      }
    } catch (error) {
      throw error;
    }
  }
}
