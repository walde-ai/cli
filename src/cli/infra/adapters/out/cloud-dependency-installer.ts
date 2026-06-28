import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

import { UserError } from '@/cli/domain/exceptions';
import {
  ICloudDependencyInstaller,
  InstallCloudDependenciesInput,
} from '@/cli/domain/ports/out/cloud-dependency-installer';

export class CloudDependencyInstaller implements ICloudDependencyInstaller {
  async install(input: InstallCloudDependenciesInput): Promise<void> {
    const packageDir = this.findNearestPackageDir(input.cloudApisDirectory);
    const command = existsSync(path.join(packageDir, 'package-lock.json'))
      ? 'npm ci'
      : 'npm install';

    execSync(command, {
      cwd: packageDir,
      stdio: 'pipe',
    });
  }

  private findNearestPackageDir(fromDirectory: string): string {
    let current = path.resolve(fromDirectory);
    while (true) {
      if (existsSync(path.join(current, 'package.json'))) {
        return current;
      }
      const parent = path.dirname(current);
      if (parent === current) {
        throw new UserError(
          `Cloud API directory ${fromDirectory} must live inside a package ` +
          'that declares @walde.ai/sdk as a dependency.'
        );
      }
      current = parent;
    }
  }
}
