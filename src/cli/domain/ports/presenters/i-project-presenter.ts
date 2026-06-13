import { Site } from '@walde.ai/sdk';

export interface ProjectListItem {
  id: string;
  name: string;
  state: string;
  stages: Array<{ name: string; siteId: string }>;
}

/**
 * Presenter contract for project-related interactions.
 *
 * Used by `walde project create`, `walde project list`, and `walde project delete`.
 * Includes site-selection helpers needed by SiteSelector for the new project flow.
 */
export interface IProjectPresenter {
  // create project
  requestProjectName(): Promise<string>;
  presentCreatedProject(projectId: string, name: string): void;
  startProjectCreation(name: string): void;
  stopProjectCreation(): void;

  // project list
  presentProjects(projects: ProjectListItem[]): void;

  // project delete
  requestDeleteConfirmation(projectId: string): Promise<boolean>;
  startProjectDeletion(projectId: string): void;
  stopProjectDeletion(): void;
  presentProjectDeleted(projectId: string): void;
  presentDeletionCancelled(): void;
  presentProjectDeletionError(message: string): void;

  // site selection helpers (shared with SiteSelector via ISiteSelectorPresenter)
  requestSiteSelection(sites: Site[]): Promise<string>;
  requestNewSiteName(): Promise<string>;
  requestNewSiteRegion(): Promise<string>;
  startSiteCreation(name: string): void;
  showSiteCreated(site: Site): void;
  showSiteCreationError(error: any): void;
}
