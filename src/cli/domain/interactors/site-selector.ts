import { Site } from '@walde.ai/sdk';

/**
 * Sentinel returned by site presenters when the user chooses to create a new site.
 */
export const CREATE_NEW_SITE_SENTINEL = 'CREATE_NEW';

/**
 * Focused presenter contract required by SiteSelector. Both the workspace
 * and the project-create flows implement this surface.
 */
export interface ISiteSelectorPresenter {
  requestSiteSelection(sites: Site[]): Promise<string>;
  requestNewSiteName(): Promise<string>;
  requestNewSiteRegion(): Promise<string>;
  startSiteCreation(name: string): void;
  showSiteCreated(site: Site): void;
  showSiteCreationError(error: any): void;
}

export interface SiteSelectorOptions {
  siteId?: string;
  createSiteName?: string;
  createSiteRegion?: string;
}

/**
 * Reusable helper for selecting an existing site or creating a new one.
 *
 * Used by both `walde create project` and `walde init`. Encapsulates the
 * previously-inlined logic from CommandWorkspaceInit so that selection
 * behaviour stays consistent across commands.
 */
export class SiteSelector {
  constructor(private readonly presenter: ISiteSelectorPresenter) {}

  /**
   * Resolve a siteId by either accepting a passed-in `siteId`, creating a
   * new site (when `createSiteName` is set), or prompting the user.
   *
   * @param walde - Configured WaldeAdmin SDK instance
   * @param options - Selector options (passed-in siteId or create-site flags)
   * @returns The resolved siteId
   */
  async selectOrCreate(walde: any, options: SiteSelectorOptions = {}): Promise<string> {
    if (options.siteId) {
      return options.siteId;
    }

    if (options.createSiteName !== undefined) {
      const region = options.createSiteRegion || await this.presenter.requestNewSiteRegion();
      return await this.createSite(walde, options.createSiteName, region);
    }

    const sitesResult = await walde.sites().list().resolve();
    if (sitesResult.isErr()) {
      throw new Error(`Failed to load sites: ${sitesResult.unwrapErr()}`);
    }
    const sites = sitesResult.unwrap() as Site[];
    const selection = await this.presenter.requestSiteSelection(sites);
    if (selection === CREATE_NEW_SITE_SENTINEL) {
      const newName = await this.presenter.requestNewSiteName();
      const newRegion = await this.presenter.requestNewSiteRegion();
      return await this.createSite(walde, newName, newRegion);
    }
    return selection;
  }

  private async createSite(walde: any, name: string, region: string): Promise<string> {
    this.presenter.startSiteCreation(name);
    const createResult = await walde.sites().create({ name, region }).resolve();
    if (createResult.isErr()) {
      this.presenter.showSiteCreationError(createResult.unwrapErr());
      throw new Error(`Failed to create site: ${createResult.unwrapErr()}`);
    }
    const siteResult = createResult.unwrap();
    this.presenter.showSiteCreated(siteResult);
    return siteResult.id!;
  }
}
