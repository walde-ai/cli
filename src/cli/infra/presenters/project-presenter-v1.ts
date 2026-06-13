import Table from 'cli-table3';
import { Site } from '@walde.ai/sdk';
import { IProjectPresenter, ProjectListItem } from '@/cli/domain/ports/presenters/i-project-presenter';
import { ISpinnerComponent } from '@/cli/domain/ports/presenters/components/i-spinner-component';
import { IPromptComponent } from '@/cli/domain/ports/presenters/components/i-prompt-component';
import { PresenterConfig } from '@/cli/domain/ports/presenters/presenter-config';
import { CREATE_NEW_SITE_SENTINEL } from '@/cli/domain/interactors/site-selector';
import { CliTheme } from './cli-theme';

/**
 * Project presenter implementation built on the shared component primitives.
 */
export class ProjectPresenterV1 implements IProjectPresenter {
  constructor(
    private readonly spinner: ISpinnerComponent,
    private readonly prompt: IPromptComponent,
    private readonly config: PresenterConfig
  ) {}

  // --- create project ---

  public async requestProjectName(): Promise<string> {
    return this.prompt.text('Project name:');
  }

  public presentCreatedProject(projectId: string, name: string): void {
    console.log();
    console.log(CliTheme.accent(`✓ Project created: ${name} (${projectId})`));
    console.log();
    console.log(CliTheme.soft(`Next: run \`walde init ${projectId}\` to set up your local workspace.`));
  }

  public startProjectCreation(name: string): void {
    this.spinner.start(`Creating project ${name}...`);
  }

  public stopProjectCreation(): void {
    this.spinner.stop();
  }

  // --- list projects ---

  public presentProjects(projects: ProjectListItem[]): void {
    if (projects.length === 0) {
      console.log(CliTheme.soft('No projects found.'));
      return;
    }

    const table = new Table({
      head: [CliTheme.accent('ID'), CliTheme.accent('Name'), CliTheme.accent('State'), CliTheme.accent('Stages')],
      style: { head: [], border: [], 'padding-left': 0, 'padding-right': 2 },
      chars: {
        'top': '', 'top-mid': '', 'top-left': '', 'top-right': '',
        'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
        'left': '', 'left-mid': '', 'mid': '', 'mid-mid': '',
        'right': '', 'right-mid': '', 'middle': ' '
      }
    });

    for (const p of projects) {
      const stagesStr = p.stages.map(s => s.name).join(', ');
      table.push([p.id, p.name, p.state, stagesStr]);
    }

    console.log(table.toString());
  }

  // --- delete project ---

  public async requestDeleteConfirmation(projectId: string): Promise<boolean> {
    return this.prompt.confirm(`Are you sure you want to delete project ${projectId}? This cannot be undone.`, false);
  }

  public startProjectDeletion(projectId: string): void {
    this.spinner.start(`Deleting project ${projectId}...`);
  }

  public stopProjectDeletion(): void {
    this.spinner.stop();
  }

  public presentProjectDeleted(projectId: string): void {
    console.log(CliTheme.accent(`✓ Project ${projectId} deleted`));
  }

  public presentDeletionCancelled(): void {
    console.log(CliTheme.soft('Deletion cancelled.'));
  }

  public presentProjectDeletionError(message: string): void {
    console.error(CliTheme.error(`✗ Failed to delete project: ${message}`));
    process.exitCode = 1;
  }

  // --- site selection helpers (mirrors WorkspacePresenterV1) ---

  public async requestSiteSelection(sites: Site[]): Promise<string> {
    const choices = [
      ...sites.map(site => ({ name: `${site.name} (${site.id})`, value: site.id })),
      { name: 'Create new site', value: CREATE_NEW_SITE_SENTINEL }
    ];
    return this.prompt.select('Select a site:', choices);
  }

  public async requestNewSiteName(): Promise<string> {
    return this.prompt.text('Name for new site:');
  }

  public async requestNewSiteRegion(): Promise<string> {
    return this.prompt.text('AWS region for new site (e.g. us-east-1):');
  }

  public startSiteCreation(name: string): void {
    this.spinner.start(`Creating site ${name}...`);
  }

  public showSiteCreated(site: Site): void {
    this.spinner.stop();
    console.log(CliTheme.accent(`✓ Site created: ${site.name} (${site.id})`));
  }

  public showSiteCreationError(error: any): void {
    this.spinner.stop();
    console.log(CliTheme.error(`✗ Site creation failed: ${error?.message ?? String(error)}`));
  }
}
