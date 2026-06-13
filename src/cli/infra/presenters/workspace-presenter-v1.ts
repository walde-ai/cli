import { ProjectWorkspaceConfig } from '@walde.ai/sdk';
import { IWorkspacePresenter } from '@/cli/domain/ports/presenters/i-workspace-presenter';
import { IPromptComponent } from '@/cli/domain/ports/presenters/components/i-prompt-component';
import { PresenterConfig } from '@/cli/domain/ports/presenters/presenter-config';

/**
 * Workspace presenter implementation for `walde init`.
 */
export class WorkspacePresenterV1 implements IWorkspacePresenter {
  constructor(
    private readonly prompt: IPromptComponent,
    private readonly config: PresenterConfig
  ) {}

  public async confirmInit(targetPath: string): Promise<boolean> {
    console.log('\nWorkspace path:');
    console.log(`  ${targetPath}`);
    console.log();
    return this.prompt.confirm('Initialize workspace with this configuration?', true);
  }

  public async requestBuildCommand(defaultValue: string): Promise<string> {
    const result = await this.prompt.text(`Build command (${defaultValue}):`);
    return result || defaultValue;
  }

  public async requestWorkingDirectory(defaultValue: string): Promise<string> {
    const result = await this.prompt.text(`Working directory (${defaultValue}):`);
    return result || defaultValue;
  }

  public async requestDistFolder(defaultValue: string): Promise<string> {
    const result = await this.prompt.text(`Dist folder (${defaultValue}):`);
    return result || defaultValue;
  }

  public async requestContentPath(defaultValue: string): Promise<string> {
    const result = await this.prompt.text(`Content path (${defaultValue}):`);
    return result || defaultValue;
  }

  public async requestAssetsPath(defaultValue: string): Promise<string> {
    const result = await this.prompt.text(`Assets path (${defaultValue}):`);
    return result || defaultValue;
  }

  public presentInitSummary(config: ProjectWorkspaceConfig): void {
    console.log('\nWorkspace configuration:');
    console.log(`  Project ID: ${config.projectId}`);
    console.log(`  Build command: ${config.ui.buildCommand ?? '(none)'}`);
    console.log(`  Working directory: ${config.ui.workingDirectory}`);
    console.log(`  Dist folder: ${config.ui.distFolder}`);
    console.log(`  Content path: ${config.content.contentPath}`);
    console.log(`  Assets path: ${config.content.assetsPath}`);
    console.log();
  }
}
