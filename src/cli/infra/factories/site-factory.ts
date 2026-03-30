import { Site, SiteState } from '@walde.ai/sdk';

/**
 * Factory for creating Site entities
 */
export class SiteFactory {
  /**
   * Create a new site for creation (no ID)
   */
  public create(name: string): Site {
    return new Site('', name, SiteState.UPDATE_REQUESTED);
  }
}
