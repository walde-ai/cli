import { Site } from '@walde.ai/sdk';

/**
 * Interface for workspace-related user interactions
 */
export interface IWorkspacePresenter {
  /**
   * Request workspace path from user
   */
  requestPath(): Promise<string>;

  /**
   * Request site selection from user
   */
  requestSiteSelection(sites: Site[]): Promise<string>;

  /**
   * Request name for new site creation
   */
  requestNewSiteName(): Promise<string>;

  /**
   * Request region for new site creation
   */
  requestNewSiteRegion(): Promise<string>;

  /**
   * Request confirmation for workspace initialization
   */
  confirmInit(path: string, siteId?: string, newSiteName?: string): Promise<boolean>;

  /**
   * Start site creation loading
   */
  startSiteCreation(name: string): void;

  /**
   * Show site creation success
   */
  showSiteCreated(site: Site): void;

  /**
   * Show site creation error
   */
  showSiteCreationError(error: any): void;
}
