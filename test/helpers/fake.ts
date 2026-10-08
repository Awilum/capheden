import { EventEmitter } from 'node:events';
import type { ChildProcess, SpawnOptions } from 'node:child_process';

import type { SpawnCaffeinate } from '../../src/services/CaffeinateService.js';

/**
 * Minimal ChildProcess stand-in shared by service and UI tests. Only the
 * surface CaffeinateService touches is implemented: pid/exit/signal state,
 * kill(), and the event emitter.
 */
export class FakeChild extends EventEmitter {
  pid: number | undefined;
  exitCode: number | null = null;
  signalCode: NodeJS.Signals | null = null;
  killed = false;
  readonly signals: NodeJS.Signals[] = [];
  #ignoreSigterm: boolean;

  constructor(options: { pid?: number; noPid?: boolean; ignoreSigterm?: boolean } = {}) {
    super();
    // `noPid` models a child that failed before the OS assigned a pid; plain
    // `undefined` would collide with the default via `??`.
    this.pid = options.noPid === true ? undefined : (options.pid ?? 12_345);
    this.#ignoreSigterm = options.ignoreSigterm ?? false;
  }

  kill(signal: NodeJS.Signals = 'SIGTERM'): boolean {
    this.signals.push(signal);
    this.killed = true;

    if (signal === 'SIGTERM' && this.#ignoreSigterm) {
      return true; // signal delivered, but the child refuses to die
    }

    // A real process reports termination through the exit event, not kill().
    this.#exit(null, signal);
    return true;
  }

  /** Simulate the OS reporting process termination. */
  #exit(code: number | null, signal: NodeJS.Signals | null): void {
    this.exitCode = code;
    this.signalCode = signal;
    this.emit('exit', code, signal);
    this.emit('close', code, signal);
  }

  exitNormally(code = 0): void {
    this.#exit(code, null);
  }
}

export interface SpawnCall {
  readonly command: string;
  readonly args: readonly string[];
  readonly options: SpawnOptions;
}

export function makeSpawn(
  child: FakeChild,
  mode: 'ok' | 'throw' | 'async-error' = 'ok',
  errorCode = 'EACCES',
): { spawn: SpawnCaffeinate; calls: SpawnCall[] } {
  const calls: SpawnCall[] = [];

  const spawn: SpawnCaffeinate = (command, args, options) => {
    calls.push({ command, args, options });

    if (mode === 'throw') {
      // spawn() is synchronous in Node: ENOENT arrives as a thrown error or an
      // async 'error' event depending on platform; both paths are covered.
      throw Object.assign(new Error('spawn ENOENT'), { code: 'ENOENT' });
    }

    if (mode === 'async-error') {
      const broken = new FakeChild({ noPid: true });
      queueMicrotask(() =>
        broken.emit('error', Object.assign(new Error(errorCode), { code: errorCode })),
      );
      return broken as unknown as ChildProcess;
    }

    return child as unknown as ChildProcess;
  };

  return { spawn, calls };
}
