import { Site } from '@walde.ai/sdk';
import { IWorkspacePresenter } from '@/cli/domain/ports/presenters/i-workspace-presenter';
import { ISpinnerComponent } from '@/cli/domain/ports/presenters/components/i-spinner-component';
import { IPromptComponent } from '@/cli/domain/ports/presenters/components/i-prompt-component';
import { PresenterConfig } from '@/cli/domain/ports/presenters/presenter-config';
import { CliTheme } from './cli-theme';

/**
 * Workspace presenter implementation using component composition
 */
export class WorkspacePresenterV1 implements IWorkspacePresenter {
  constructor(
    private readonly spinner: ISpinnerComponent,
    private readonly prompt: IPromptComponent,
    private readonly config: PresenterConfig
  ) {}

  public async requestPath(): Promise<string> {
    return this.prompt.text('Workspace path (default: current directory):');
  }

  public async requestSiteSelection(sites: Site[]): Promise<string> {
    const choices = [
      ...sites.map(site => ({
        name: `${site.name} (${site.id})`,
        value: site.id
      })),
      { name: 'Create new site', value: 'CREATE_NEW' }
    ];

    return this.prompt.select('Select a site:', choices);
  }

  public async requestNewSiteName(): Promise<string> {
    return this.prompt.text('Name for new site (optional):');
  }

  public async requestNewSiteRegion(): Promise<string> {
    return this.prompt.text('AWS region for new site (e.g. us-east-1):');
  }

  public async confirmInit(path: string, siteId?: string, newSiteName?: string): Promise<boolean> {
    const details = [
      `Path: ${path}`,
      siteId ? `Site ID: ${siteId}` : `New site name: ${newSiteName}`
    ];

    console.log('\nWorkspace configuration:');
    details.forEach(detail => console.log(`  ${detail}`));
    console.log();

    return this.prompt.confirm('Initialize workspace with this configuration?');
  }

  public startSiteCreation(name: string): void {
    this.spinner.start(`Creating site ${name}...`);
  }

  public showSiteCreated(site: Site): void {
    this.spinner.stop();
    console.log(CliTheme.accent(`✓ Site created: ${site.name} (${site.id})`));
  }

  public showSiteCreationError(error: any): void {
    this.spinner.stop();
    
    let errorMessage = String(error);
    
    // Extract details from WaldeError if available
    if (error && typeof error === 'object' && error.details) {
      const { statusCode, statusMessage, response, url } = error.details;
      errorMessage = error.message || String(error);
      
      if (statusCode) {
        errorMessage += `\n  HTTP Status: ${statusCode} ${statusMessage || ''}`;
      }
      
      if (url) {
        errorMessage += `\n  URL: ${url}`;
      }
      
      if (response && typeof response === 'object') {
        // Show relevant parts of response
        if (response.message) {
          errorMessage += `\n  Server Message: ${response.message}`;
        }
        if (response.error) {
          errorMessage += `\n  Server Error: ${response.error}`;
        }
        if (response.details) {
          errorMessage += `\n  Details: ${JSON.stringify(response.details, null, 2)}`;
        }
      }
    }
    
    console.log(CliTheme.error(`✗ Site creation failed: ${errorMessage}`));
  }
}
