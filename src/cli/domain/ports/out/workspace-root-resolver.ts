import { ProjectWorkspaceConfig } from '@walde.ai/sdk';

export interface WorkspaceWithRoot {
  config: ProjectWorkspaceConfig;
  rootPath: string;
}

export interface WorkspaceRootResolver {
  findWorkspaceWithRoot(startPath: string): Promise<WorkspaceWithRoot | null>;
}
