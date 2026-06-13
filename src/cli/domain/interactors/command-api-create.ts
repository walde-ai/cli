import * as path from 'path';

import { MakeWaldeWorkspace, FileWorkspaceConfigRepo } from '@walde.ai/sdk';
import { UserError } from '@/cli/domain/exceptions';

export interface CommandApiCreateOptions {
  /** PascalCase class name, e.g. "MyApi" */
  name: string;
  /** Optional explicit target path; defaults to the nearest workspace root */
  targetPath?: string;
}

/**
 * Command interactor for `walde api create --name <Name>`.
 *
 * Resolves the workspace root from the nearest walde.json and delegates all
 * file creation to MakeWaldeWorkspace().scaffoldApi(...). No file logic lives
 * in this interactor.
 */
export class CommandApiCreate {
  async execute(options: CommandApiCreateOptions): Promise<void> {
    const targetPath = await this.resolveTargetPath(options.targetPath);

    const result = await MakeWaldeWorkspace()
      .scaffoldApi({ name: options.name, targetPath })
      .resolve();

    if (result.isErr()) {
      throw new UserError(result.unwrapErr());
    }

    const kebab = this.toKebab(options.name);
    const camel = options.name.charAt(0).toLowerCase() + options.name.slice(1);

    console.log(`✓ Created API '${options.name}'`);
    console.log(`  Handler:   dev/cloud/src/apis/${kebab}.ts`);
    console.log(`  Contracts: dev/cloud/src/contracts/${kebab}.ts`);
    console.log(`  Registry updated with key: ${camel}`);
  }

  private async resolveTargetPath(explicitPath?: string): Promise<string> {
    if (explicitPath) {
      return path.resolve(explicitPath);
    }

    const repo = new FileWorkspaceConfigRepo();
    const found = await repo.findWorkspaceWithRoot();

    if (!found) {
      throw new UserError(
        'No walde.json found in current directory or any parent directory. ' +
          'Run `walde init` first or pass --target-path.'
      );
    }

    return found.rootPath;
  }

  private toKebab(pascal: string): string {
    return pascal
      .replace(/([A-Z])/g, (match, char, offset) => (offset === 0 ? char.toLowerCase() : `-${char.toLowerCase()}`))
      .replace(/^-/, '');
  }
}
