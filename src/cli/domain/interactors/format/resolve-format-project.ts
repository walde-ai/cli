import { UserError } from '@/cli/domain/exceptions';

/**
 * The workspace lookup `ResolveFormatProject` consults when no explicit
 * `--project` was supplied. Structurally satisfied by the SDK's
 * `FileWorkspaceConfigRepo`.
 */
export interface FormatWorkspaceLookup {
  findWorkspace(): Promise<{ projectId: string } | null>;
}

/**
 * Shared project-id resolution for the format commands: an explicit
 * `--project` value wins, then the `walde.json` workspace marker discovered
 * through the SDK's workspace discovery, then a `UserError` naming both
 * remedies — the same message shape the Knowledge Base commands use.
 */
export class ResolveFormatProject {
  constructor(private readonly workspaceLookup: FormatWorkspaceLookup) {}

  public async resolve(explicitProjectId: string | undefined): Promise<string> {
    if (explicitProjectId) {
      return explicitProjectId;
    }

    const workspace = await this.workspaceLookup.findWorkspace();
    if (workspace !== null) {
      return workspace.projectId;
    }

    throw new UserError('No project resolved. Run from a workspace directory or pass --project <projectId>.');
  }
}
