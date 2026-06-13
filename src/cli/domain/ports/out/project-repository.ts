/**
 * Output port for fetching project data from the backend
 */
export interface IProjectRepository {
  get(projectId: string): Promise<{ id: string; name: string; state: string; repositoryUrl: string; stages: Array<{ name: string; siteId: string }> }>;
}
