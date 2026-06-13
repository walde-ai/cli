import * as path from 'path';
import { createRequire } from 'module';
import { Readable } from 'stream';

import { UserError } from '@/cli/domain/exceptions';
import { ProcessSpawner, SpawnedProcess } from '@/cli/domain/ports/out/process-spawner';
import { WorkspaceRootResolver } from '@/cli/domain/ports/out/workspace-root-resolver';

export interface CommandDevStartOptions {
  path?: string;
}

type ProcessName = 'api' | 'ui';

interface ProcessState {
  process: SpawnedProcess;
  exited: boolean;
}

export class CommandDevStart {
  constructor(
    private readonly workspaceRootResolver: WorkspaceRootResolver,
    private readonly processSpawner: ProcessSpawner
  ) {}

  async execute(options: CommandDevStartOptions): Promise<void> {
    const startPath = options.path ? path.resolve(options.path) : process.cwd();
    const workspace = await this.workspaceRootResolver.findWorkspaceWithRoot(startPath);

    if (!workspace) {
      throw new UserError(
        'No walde.json found in current directory or any parent directory. ' +
          'Run `walde init` first or pass --path.'
      );
    }

    const workspaceRoot = workspace.rootPath;
    const apisDirectory = path.resolve(workspaceRoot, 'dev/cloud/src/apis');
    const devCloudDirectory = path.resolve(workspaceRoot, 'dev/cloud');
    const uiDirectory = path.resolve(workspaceRoot, workspace.config.ui.workingDirectory);
    const sdkDevServerPath = this.resolveSdkDevServerPath(devCloudDirectory);

    const apiProcess = this.processSpawner.spawn({
      command: 'npx',
      args: [
        '--prefix',
        devCloudDirectory,
        'tsx',
        '--watch',
        sdkDevServerPath,
        '--apis-dir',
        apisDirectory,
      ],
      cwd: workspaceRoot,
    });

    const uiProcess = this.processSpawner.spawn({
      command: 'npm',
      args: ['run', 'dev'],
      cwd: uiDirectory,
    });

    this.pipePrefixedOutput(apiProcess.stdout, '[api] ');
    this.pipePrefixedOutput(apiProcess.stderr, '[api] ');
    this.pipePrefixedOutput(uiProcess.stdout, '[ui] ');
    this.pipePrefixedOutput(uiProcess.stderr, '[ui] ');

    await this.waitForCompletion(
      { process: apiProcess, exited: false },
      { process: uiProcess, exited: false }
    );
  }

  private resolveSdkDevServerPath(devCloudDirectory: string): string {
    const requireFromWorkspace = createRequire(path.join(devCloudDirectory, 'package.json'));
    return requireFromWorkspace.resolve('@walde.ai/sdk/bin/dev-server');
  }

  private pipePrefixedOutput(stream: Readable | null, prefix: string): void {
    if (!stream) {
      return;
    }

    let buffer = '';
    stream.on('data', (chunk: Buffer | string) => {
      buffer += chunk.toString();
      const parts = buffer.split(/\r?\n/);
      buffer = parts.pop() ?? '';

      for (const line of parts) {
        process.stdout.write(`${prefix}${line}\n`);
      }
    });

    stream.on('end', () => {
      if (buffer.length > 0) {
        process.stdout.write(`${prefix}${buffer}\n`);
      }
    });
  }

  private waitForCompletion(apiState: ProcessState, uiState: ProcessState): Promise<void> {
    return new Promise((resolve, reject) => {
      let shuttingDown = false;
      let finalError: Error | undefined;
      let settled = false;

      const maybeFinish = (): void => {
        if (!apiState.exited || !uiState.exited) {
          return;
        }
        if (settled) {
          return;
        }
        settled = true;
        cleanupProcessListeners();
        if (finalError) {
          reject(finalError);
        } else {
          resolve();
        }
      };

      const terminateProcess = (state: ProcessState): void => {
        if (state.exited) {
          return;
        }
        state.process.kill('SIGTERM');
      };

      const onSignal = (): void => {
        if (shuttingDown) {
          return;
        }
        shuttingDown = true;
        terminateProcess(apiState);
        terminateProcess(uiState);
      };

      const onProcessExit = (
        name: ProcessName,
        state: ProcessState,
        otherState: ProcessState,
        code: number | null,
        signal: NodeJS.Signals | null
      ): void => {
        state.exited = true;

        if (!shuttingDown) {
          shuttingDown = true;
          terminateProcess(otherState);

          if (code !== 0) {
            const renderedCode = code === null ? `signal ${signal ?? 'unknown'}` : `code ${code}`;
            finalError = new UserError(`[${name}] process exited unexpectedly with ${renderedCode}`);
          }
        }

        maybeFinish();
      };

      const onApiError = (error: Error): void => {
        if (!finalError) {
          finalError = error;
        }
        apiState.exited = true;
        shuttingDown = true;
        terminateProcess(uiState);
        maybeFinish();
      };

      const onUiError = (error: Error): void => {
        if (!finalError) {
          finalError = error;
        }
        uiState.exited = true;
        shuttingDown = true;
        terminateProcess(apiState);
        maybeFinish();
      };

      const onApiExit = (code: number | null, signal: NodeJS.Signals | null): void => {
        onProcessExit('api', apiState, uiState, code, signal);
      };

      const onUiExit = (code: number | null, signal: NodeJS.Signals | null): void => {
        onProcessExit('ui', uiState, apiState, code, signal);
      };

      const onSigInt = (): void => {
        onSignal();
      };

      const onSigTerm = (): void => {
        onSignal();
      };

      process.on('SIGINT', onSigInt);
      process.on('SIGTERM', onSigTerm);
      apiState.process.on('error', onApiError);
      apiState.process.on('exit', onApiExit);
      uiState.process.on('error', onUiError);
      uiState.process.on('exit', onUiExit);

      const cleanupProcessListeners = (): void => {
        process.removeListener('SIGINT', onSigInt);
        process.removeListener('SIGTERM', onSigTerm);
      };
    });
  }
}
