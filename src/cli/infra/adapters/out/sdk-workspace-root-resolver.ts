import { FileWorkspaceConfigRepo } from '@walde.ai/sdk';

import { WorkspaceRootResolver, WorkspaceWithRoot } from '@/cli/domain/ports/out/workspace-root-resolver';

export class SdkWorkspaceRootResolver implements WorkspaceRootResolver {
  private readonly workspaceConfigRepo: FileWorkspaceConfigRepo;

  constructor() {
    this.workspaceConfigRepo = new FileWorkspaceConfigRepo();
  }

  async findWorkspaceWithRoot(startPath: string): Promise<WorkspaceWithRoot | null> {
    return this.workspaceConfigRepo.findWorkspaceWithRoot(startPath);
  }
}
