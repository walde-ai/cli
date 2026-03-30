import { WorkspaceConfig } from '@walde.ai/sdk';

/**
 * Interface for workspace configuration persistence
 */
export interface WorkspaceConfigRepo {
  /**
   * Saves workspace configuration to the specified path
   * @param path - Directory path where walde.json should be created
   * @param config - Workspace configuration to save
   */
  save(path: string, config: WorkspaceConfig): Promise<void>;

  /**
   * Loads workspace configuration from the specified path
   * @param path - Directory path where walde.json is located
   * @returns Promise resolving to workspace configuration
   */
  load(path: string): Promise<WorkspaceConfig>;
}
