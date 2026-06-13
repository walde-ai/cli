import { ProjectWorkspaceConfig } from '@walde.ai/sdk';
import { UserError } from '@/cli/domain/exceptions';
import { IProjectRepository } from '@/cli/domain/ports/out/project-repository';

export { IProjectRepository };

export interface ResolvedTarget {
  siteId: string;
}

export interface ResolveTargetOptions {
  siteIdOption?: string;
  targetOption?: string;
  workspaceConfig?: ProjectWorkspaceConfig;
}

/**
 * Resolves the target siteId for push or cache commands using project stage resolution.
 */
export class ResolveTarget {
  constructor(
    private readonly projectRepository: IProjectRepository
  ) {}

  async execute({ siteIdOption, targetOption, workspaceConfig }: ResolveTargetOptions): Promise<ResolvedTarget> {
    if (siteIdOption) {
      return { siteId: siteIdOption };
    }

    if (!workspaceConfig) {
      throw new UserError('No workspace detected and no --site-id provided. Either run from a workspace directory or specify --site-id option.');
    }

    const project = await this.projectRepository.get(workspaceConfig.projectId);

    if (targetOption) {
      const stage = project.stages.find(s => s.name === targetOption);
      if (!stage) {
        const availableNames = project.stages.map(s => s.name).join(', ');
        throw new UserError(
          `Target "${targetOption}" not found. Available stages: ${availableNames}`
        );
      }
      return { siteId: stage.siteId };
    }

    const prodStage = project.stages.find(s => s.name === 'prod');
    if (!prodStage) {
      throw new UserError(
        'No "prod" stage found in the project. Use --target <stageName> to specify a stage.'
      );
    }
    return { siteId: prodStage.siteId };
  }
}
