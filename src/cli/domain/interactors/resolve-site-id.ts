import { WorkspaceConfig } from '@walde.ai/sdk';
import { UserError } from '@/cli/domain/exceptions';

/**
 * Use case for resolving siteId from multiple sources
 */
export class ResolveSiteId {
  /**
   * Resolves siteId from provided parameter or workspace config
   * @param providedSiteId - Optional siteId provided by user
   * @param workspaceConfig - Optional workspace configuration
   * @param required - Whether siteId is required (defaults to true)
   * @returns Resolved siteId or undefined if not required and not found
   * @throws Error if siteId is required but cannot be resolved
   */
  public execute(providedSiteId?: string, workspaceConfig?: WorkspaceConfig | null, required: boolean = true): string | undefined {
    // Use provided siteId if given (overrides workspace)
    if (providedSiteId) {
      return providedSiteId;
    }

    // Use workspace siteId if available
    if (workspaceConfig?.siteId) {
      return workspaceConfig.siteId;
    }

    // No siteId available from any source
    if (required) {
      if (workspaceConfig) {
        throw new UserError('Workspace configuration missing siteId. Please reinitialize workspace or use --site-id option.');
      } else {
        throw new UserError('No workspace detected and no --site-id provided. Either run from a workspace directory or specify --site-id option.');
      }
    }

    // Not required, return undefined
    return undefined;
  }
}
