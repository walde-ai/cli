import { ChildProcessWithoutNullStreams, spawn } from 'child_process';

import { ProcessSpawner, SpawnProcessParams, SpawnedProcess } from '@/cli/domain/ports/out/process-spawner';

class NodeSpawnedProcess implements SpawnedProcess {
  constructor(private readonly child: ChildProcessWithoutNullStreams) {}

  get stdout() {
    return this.child.stdout;
  }

  get stderr() {
    return this.child.stderr;
  }

  get pid() {
    return this.child.pid;
  }

  on(event: 'error', listener: (error: Error) => void): this;
  on(event: 'exit', listener: (code: number | null, signal: NodeJS.Signals | null) => void): this;
  on(
    event: 'error' | 'exit',
    listener: ((error: Error) => void) | ((code: number | null, signal: NodeJS.Signals | null) => void)
  ): this {
    this.child.on(event, listener as never);
    return this;
  }

  kill(signal?: NodeJS.Signals): boolean {
    if (signal) {
      return this.child.kill(signal);
    }
    return this.child.kill();
  }
}

export class NodeProcessSpawner implements ProcessSpawner {
  spawn(params: SpawnProcessParams): SpawnedProcess {
    const child = spawn(params.command, params.args, {
      cwd: params.cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    return new NodeSpawnedProcess(child);
  }
}
