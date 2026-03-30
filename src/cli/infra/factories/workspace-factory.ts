import { DetectWorkspace } from '@/cli/domain/interactors/detect-workspace';
import { ResolveSiteId } from '@/cli/domain/interactors/resolve-site-id';
import { FileWorkspaceConfigRepo } from '@walde.ai/sdk';

/**
 * Factory for workspace-related dependencies
 */
export class WorkspaceFactory {
  /**
   * Creates DetectWorkspace interactor with file-based workspace config repository
   */
  public static CreateDetectWorkspace(): DetectWorkspace {
    const workspaceConfigRepo = new FileWorkspaceConfigRepo();
    return new DetectWorkspace(workspaceConfigRepo);
  }

  /**
   * Creates ResolveSiteId interactor
   */
  public static CreateResolveSiteId(): ResolveSiteId {
    return new ResolveSiteId();
  }
}
