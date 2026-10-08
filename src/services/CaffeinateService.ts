import { spawn } from 'node:child_process';
import type { ChildProcess, SpawnOptions } from 'node:child_process';

import { SECOND_MS } from '../utils/duration.js';
import { CAFFEINATE_BINARY } from '../utils/platform.js';

/** Injection point so tests can supply a fake child process. */
export type SpawnCaffeinate = (
  command: string,
  args: readonly string[],
  options: SpawnOptions,
) => ChildProcess;

export interface CaffeinateStartOptions {
  /** Session length. Omit for an indefinite session. */
  readonly durationMs?: number | undefined;
  /** Also keep the display awake (`caffeinate -d`). */
  readonly preventDisplaySleep?: boolean;
  /** Called when caffeinate exits on its own, i.e. not because we asked it to. */
  readonly onUnexpectedExit?: (info: {
    code: number | null;
    signal: NodeJS.Signals | null;
  }) => void;
}

export interface CaffeinateStartResult {
  readonly pid: number | undefined;
  readonly args: readonly string[];
  readonly durationMs: number | undefined;
}

export interface CaffeinateStopOptions {
  readonly signal?: NodeJS.Signals;
  readonly timeoutMs?: number;
}

export interface CaffeinateStopResult {
  readonly alreadyStopped: boolean;
  /** True when the child ignored SIGTERM and had to be killed. */
  readonly forced: boolean;
}

export class CaffeinateError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'CaffeinateError';
  }
}

const DEFAULT_STOP_TIMEOUT_MS = 2_000;
const KILL_GRACE_MS = 500;

/**
 * Owns the native `caffeinate` child process.
 *
 * Every piece of process management lives here: React components never touch
 * `child_process`, they only call `start()` / `stop()`.
 */
export class CaffeinateService {
  readonly #spawn: SpawnCaffeinate;
  readonly #binaryPath: string;
  #child: ChildProcess | null = null;
  #stopping = false;

  constructor(options: { spawn?: SpawnCaffeinate; binaryPath?: string } = {}) {
    this.#spawn =
      options.spawn ?? ((command, args, spawnOptions) => spawn(command, [...args], spawnOptions));
    this.#binaryPath = options.binaryPath ?? CAFFEINATE_BINARY;
  }

  /** `true` while a caffeinate child is alive and we have not asked it to stop. */
  isRunning(): boolean {
    const child = this.#child;
    return child !== null && !hasExited(child);
  }

  getProcess(): ChildProcess | null {
    return this.#child;
  }

  getPid(): number | undefined {
    return this.#child?.pid;
  }

  getBinaryPath(): string {
    return this.#binaryPath;
  }

  /** Arguments handed to caffeinate for a given session. Exposed for tests + docs. */
  buildArgs(options: CaffeinateStartOptions = {}): string[] {
    const args = ['-i'];

    if (options.preventDisplaySleep === true) {
      args.push('-d');
    }

    if (options.durationMs !== undefined) {
      // caffeinate drops the assertion itself when the timeout elapses, which
      // keeps us safe even if our own timer is delayed.
      args.push('-t', String(Math.max(1, Math.round(options.durationMs / SECOND_MS))));
    }

    return args;
  }

  /** Spawn caffeinate and wait until the OS confirms the process exists. */
  async start(options: CaffeinateStartOptions = {}): Promise<CaffeinateStartResult> {
    if (this.isRunning()) {
      throw new CaffeinateError('A coffee is already brewing. Stop the current session first.');
    }

    const args = this.buildArgs(options);
    this.#stopping = false;

    let child: ChildProcess;
    try {
      child = this.#spawn(this.#binaryPath, args, { stdio: 'ignore' });
    } catch (error) {
      throw new CaffeinateError(`Could not start caffeinate: ${errorMessage(error)}`, {
        cause: error,
      });
    }

    try {
      await waitForSpawn(child);
    } catch (error) {
      throw new CaffeinateError(describeSpawnFailure(this.#binaryPath, error), { cause: error });
    }

    this.#child = child;

    child.on('exit', (code, signal) => {
      const wasExpected = this.#stopping;
      this.#child = null;
      this.#stopping = false;

      if (!wasExpected) {
        options.onUnexpectedExit?.({ code, signal });
      }
    });

    return { pid: child.pid, args, durationMs: options.durationMs };
  }

  /**
   * Ask caffeinate to exit, then wait for it. Escalates to SIGKILL if the child
   * refuses, so the Mac can never be left with a dangling sleep assertion.
   */
  async stop(options: CaffeinateStopOptions = {}): Promise<CaffeinateStopResult> {
    const child = this.#child;

    if (child === null) {
      return { alreadyStopped: true, forced: false };
    }

    if (hasExited(child)) {
      this.#child = null;
      return { alreadyStopped: true, forced: false };
    }

    const timeoutMs = options.timeoutMs ?? DEFAULT_STOP_TIMEOUT_MS;
    const exited = once(child, ['exit', 'close']);

    this.#stopping = true;
    sendSignal(child, options.signal ?? 'SIGTERM');

    const forced = await raceWithTimeout(exited, timeoutMs);

    if (forced) {
      sendSignal(child, 'SIGKILL');
      await raceWithTimeout(exited, KILL_GRACE_MS);
    }

    this.#child = null;
    this.#stopping = false;

    return { alreadyStopped: false, forced };
  }

  /**
   * Last resort synchronous teardown, safe to call from `process.on('exit')`
   * where nothing async can be awaited.
   */
  cleanup(): void {
    const child = this.#child;
    this.#child = null;
    this.#stopping = true;

    if (child === null || hasExited(child)) return;

    try {
      sendSignal(child, 'SIGKILL');
    } catch {
      // Nothing sensible left to do: the process is already gone.
    }
  }
}

function hasExited(child: ChildProcess): boolean {
  // `killed` only means "a signal was delivered", so it must not be used here:
  // a child that ignored SIGTERM still needs a SIGKILL.
  return child.exitCode !== null || child.signalCode !== null;
}

function sendSignal(child: ChildProcess, signal: NodeJS.Signals): void {
  try {
    child.kill(signal);
  } catch {
    // Already dead or not permitted; treat as stopped.
  }
}

function once(child: ChildProcess, events: readonly string[]): Promise<void> {
  return new Promise<void>((resolve) => {
    let settled = false;

    const finish = (): void => {
      if (settled) return;
      settled = true;
      resolve();
    };

    for (const event of events) {
      child.once(event, finish);
    }

    child.once('error', finish);
  });
}

async function raceWithTimeout(promise: Promise<void>, timeoutMs: number): Promise<boolean> {
  let timer: NodeJS.Timeout | undefined;

  const timeout = new Promise<boolean>((resolve) => {
    timer = setTimeout(() => resolve(true), timeoutMs);
    timer.unref?.();
  });

  try {
    return await Promise.race([promise.then(() => false), timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function waitForSpawn(child: ChildProcess): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (child.pid !== undefined) {
      // The child already exists (some spawn implementations emit synchronously).
      resolve();
      return;
    }

    const onSpawn = (): void => {
      child.removeListener('error', onError);
      resolve();
    };

    const onError = (error: unknown): void => {
      child.removeListener('spawn', onSpawn);
      reject(error instanceof Error ? error : new Error(String(error)));
    };

    child.once('spawn', onSpawn);
    child.once('error', onError);
  });
}

function describeSpawnFailure(binaryPath: string, error: unknown): string {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code)
      : undefined;

  if (code === 'ENOENT') {
    return `Could not find caffeinate at ${binaryPath}. It ships with macOS — try updating macOS or reinstalling it.`;
  }

  if (code === 'EACCES') {
    return `Not allowed to run ${binaryPath}.`;
  }

  return `Could not start caffeinate: ${errorMessage(error)}`;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
