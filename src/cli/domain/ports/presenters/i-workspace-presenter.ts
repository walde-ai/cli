import { ProjectWorkspaceConfig } from '@walde.ai/sdk';

/**
 * Interface for `walde init` user interactions.
 *
 * The init command now starts from an existing walde.json (created by
 * `walde create project`), so site selection and project creation prompts
 * are no longer part of this presenter.
 */
export interface IWorkspacePresenter {
  confirmInit(path: string): Promise<boolean>;
  requestBuildCommand(defaultValue: string): Promise<string>;
  requestWorkingDirectory(defaultValue: string): Promise<string>;
  requestDistFolder(defaultValue: string): Promise<string>;
  requestContentPath(defaultValue: string): Promise<string>;
  requestAssetsPath(defaultValue: string): Promise<string>;
  presentInitSummary(config: ProjectWorkspaceConfig): void;
}
