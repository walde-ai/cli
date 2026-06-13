import { WorkspaceConfigRepo } from '@/cli/domain/ports/out/workspace-config-repo';
import { ProjectWorkspaceConfig } from '@walde.ai/sdk';

/**
 * Use case for detecting if current directory is a workspace
 */
export class DetectWorkspace {
  public constructor(
    private readonly workspaceConfigRepo: WorkspaceConfigRepo
  ) {}

  public async execute(path: string = process.cwd()): Promise<ProjectWorkspaceConfig | null> {
    try {
      const config = await this.workspaceConfigRepo.load(path);
      return config;
    } catch (error) {
      return null;
    }
  }
}
