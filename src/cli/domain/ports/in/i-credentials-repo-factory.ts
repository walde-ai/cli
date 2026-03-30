import { CredentialsRepo } from './credentials-repo';

/**
 * Factory interface for creating credentials repositories.
 * Implementations defer dependency resolution (e.g., stage) to create() time,
 * enabling correct behavior when the stage is only known at command execution.
 */
export interface ICredentialsRepoFactory {
  create(): CredentialsRepo;
}
