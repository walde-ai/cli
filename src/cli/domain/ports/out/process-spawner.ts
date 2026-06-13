import { Readable } from 'stream';

export interface SpawnedProcess {
  readonly stdout: Readable | null;
  readonly stderr: Readable | null;
  readonly pid: number | undefined;
  on(event: 'error', listener: (error: Error) => void): this;
  on(event: 'exit', listener: (code: number | null, signal: NodeJS.Signals | null) => void): this;
  kill(signal?: NodeJS.Signals): boolean;
}

export interface SpawnProcessParams {
  command: string;
  args: string[];
  cwd: string;
}

export interface ProcessSpawner {
  spawn(params: SpawnProcessParams): SpawnedProcess;
}
