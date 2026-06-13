import * as path from 'path';
import { MakeWaldeAdmin, CredentialsProvider, ProjectWorkspaceConfig, FileWorkspaceConfigRepo } from '@walde.ai/sdk';

import { IWorkspacePresenter } from '@/cli/domain/ports/presenters/i-workspace-presenter';
import { ILoadConfig } from '@/cli/domain/ports/in/i-load-config';

export interface WorkspaceInitOptions {
  targetPath?: string;
  /** When provided, scaffolds locally without any backend interaction. */
  projectId?: string;
}

interface ProjectStatus {
  state: string;
}

/**
 * Command interactor for `walde init`.
 *
 * When a projectId is given directly, scaffolds the workspace locally without
 * any backend interaction — the project ID is taken as valid. This is the
 * recommended flow for local development and demos.
 *
 * When no projectId is provided, reads the existing `walde.json`, waits until
 * the backend project transitions to ACTIVE (for projects provisioned via the
 * Hub), then asks for UI/content configuration.
 */
export class CommandWorkspaceInit {
  /** Maximum time to wait for project to reach ACTIVE state. */
  private static readonly POLL_TIMEOUT_MS = 5 * 60 * 1000;
  private static readonly POLL_INTERVAL_MS = 5_000;

  constructor(
    private readonly credentialsProvider: CredentialsProvider,
    private readonly presenter: IWorkspacePresenter,
    private readonly configLoader: ILoadConfig
  ) {}

  async execute(options: WorkspaceInitOptions): Promise<void> {
    const workspacePath = path.resolve(options.targetPath || process.cwd());
    const repo = new FileWorkspaceConfigRepo();

    if (options.projectId) {
      await this.initWithProjectId(workspacePath, options.projectId, repo);
      return;
    }

    await this.initFromRemote(workspacePath, repo);
  }

  /**
   * Fast local path: project ID supplied directly, no backend interaction.
   * Uses default UI/content layout and scaffolds immediately.
   */
  private async initWithProjectId(
    workspacePath: string,
    projectId: string,
    repo: FileWorkspaceConfigRepo
  ): Promise<void> {
    const workspaceConfig = new ProjectWorkspaceConfig(
      projectId,
      { buildCommand: null, workingDirectory: './dev/ui', distFolder: 'dist' },
      { contentPath: 'content/content', assetsPath: 'content/assets' }
    );

    this.presenter.presentInitSummary(workspaceConfig);

    const shouldProceed = await this.presenter.confirmInit(workspacePath);
    if (!shouldProceed) {
      console.log('Workspace initialization cancelled.');
      return;
    }

    await repo.save(workspacePath, workspaceConfig);

    const config = await this.configLoader.execute();
    const walde = MakeWaldeAdmin({
      credentialsProvider: this.credentialsProvider,
      endpoint: config.settings.endpoint,
      clientId: config.settings.clientId,
      region: config.settings.region,
      s3ClientFactory: config.s3ClientFactory
    });

    const result = await walde.workspace().init({
      targetPath: workspacePath,
      projectId,
      ui: { buildCommand: null, workingDirectory: './dev/ui', distFolder: 'dist' },
      content: { contentPath: 'content/content', assetsPath: 'content/assets' }
    }).resolve();

    if (result.isErr()) {
      throw new Error(result.unwrapErr());
    }

    console.log('✓ Workspace initialized successfully!');
  }

  /**
   * Remote path: no project ID given, reads walde.json, polls backend until
   * ACTIVE, then prompts for UI/content configuration.
   */
  private async initFromRemote(workspacePath: string, repo: FileWorkspaceConfigRepo): Promise<void> {
    const minimal = await repo.loadMinimal(workspacePath);
    const projectId = minimal.projectId;

    const config = await this.configLoader.execute();
    const walde = MakeWaldeAdmin({
      credentialsProvider: this.credentialsProvider,
      endpoint: config.settings.endpoint,
      clientId: config.settings.clientId,
      region: config.settings.region,
      s3ClientFactory: config.s3ClientFactory
    });

    await this.waitForActive(walde, projectId);

    const buildCommand = await this.presenter.requestBuildCommand('npm run build');
    const workingDirectory = await this.presenter.requestWorkingDirectory('./dev/ui');
    const distFolder = await this.presenter.requestDistFolder('dist');
    const contentPath = await this.presenter.requestContentPath('content/content');
    const assetsPath = await this.presenter.requestAssetsPath('content/assets');

    const workspaceConfig = new ProjectWorkspaceConfig(
      projectId,
      { buildCommand, workingDirectory, distFolder },
      { contentPath, assetsPath }
    );

    this.presenter.presentInitSummary(workspaceConfig);

    const shouldProceed = await this.presenter.confirmInit(workspacePath);
    if (!shouldProceed) {
      console.log('Workspace initialization cancelled.');
      return;
    }

    const result = await walde.workspace().init({
      targetPath: workspacePath,
      projectId,
      ui: { buildCommand, workingDirectory, distFolder },
      content: { contentPath, assetsPath }
    }).resolve();

    if (result.isErr()) {
      throw new Error(result.unwrapErr());
    }

    console.log('✓ Workspace initialized successfully!');
  }

  /**
   * Poll the backend until the project reaches ACTIVE state (or fails).
   */
  private async waitForActive(walde: any, projectId: string): Promise<void> {
    const startTime = Date.now();
    let lastState = '';

    while (Date.now() - startTime < CommandWorkspaceInit.POLL_TIMEOUT_MS) {
      const result = await walde.api().call({
        method: 'GET',
        endpoint: `/v1/projects/${projectId}`
      }).resolve();

      if (result.isErr()) {
        throw new Error(`Failed to load project: ${result.unwrapErr()}`);
      }

      const project = result.unwrap() as ProjectStatus;

      if (project.state === 'ACTIVE') {
        return;
      }
      if (project.state === 'ERROR') {
        throw new Error(`Project ${projectId} entered ERROR state during provisioning`);
      }

      if (project.state !== lastState) {
        console.log(`Waiting for project ${projectId} to become ACTIVE (current: ${project.state})...`);
        lastState = project.state;
      }

      await this.sleep(CommandWorkspaceInit.POLL_INTERVAL_MS);
    }

    throw new Error(`Timed out waiting for project ${projectId} to become ACTIVE`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
