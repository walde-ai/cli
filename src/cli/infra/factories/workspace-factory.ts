import { DetectWorkspace } from '@/cli/domain/interactors/detect-workspace';
import { ResolveTarget, IProjectRepository } from '@/cli/domain/interactors/resolve-target';
import { FileWorkspaceConfigRepo } from '@walde.ai/sdk';

/**
 * Factory for workspace-related dependencies
 */
export class WorkspaceFactory {
  public static CreateDetectWorkspace(): DetectWorkspace {
    const workspaceConfigRepo = new FileWorkspaceConfigRepo();
    return new DetectWorkspace(workspaceConfigRepo);
  }

  public static CreateResolveTarget(projectRepository: IProjectRepository): ResolveTarget {
    return new ResolveTarget(projectRepository);
  }
}
