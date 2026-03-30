import { WorkspaceConfigRepo } from '@/cli/domain/ports/out/workspace-config-repo';
import { WorkspaceConfig } from '@walde.ai/sdk';

/**
 * Use case for detecting if current directory is a workspace
 */
export class DetectWorkspace {
  public constructor(
    private readonly workspaceConfigRepo: WorkspaceConfigRepo
  ) {}

  /**
   * Detects if the specified path is a workspace directory
   * @param path - Directory path to check (defaults to current directory)
   * @returns WorkspaceConfig if workspace found, null if not a workspace
   */
  public async execute(path: string = process.cwd()): Promise<WorkspaceConfig | null> {
    try {
      const config = await this.workspaceConfigRepo.load(path);
      return config;
    } catch (error) {
      // Not a workspace if config file doesn't exist or is invalid
      return null;
    }
  }
}
