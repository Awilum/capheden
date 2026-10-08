import { describe, it, expect, vi } from 'vitest';

import { installShutdownHandlers } from '../src/services/ProcessLifecycle.js';
import type { ShutdownReason, ShutdownTarget } from '../src/services/ProcessLifecycle.js';

/**
 * Fake process: records listeners and exit codes so signal handling can be
 * tested without ever signalling the real test runner.
 */
class FakeProcess implements ShutdownTarget {
  readonly listeners = new Map<string, Array<(...args: unknown[]) => void>>();
  readonly exitCodes: number[] = [];

  on(event: string, listener: (...args: unknown[]) => void): this {
    const list = this.listeners.get(event) ?? [];
    list.push(listener);
    this.listeners.set(event, list);
    return this;
  }

  off(event: string, listener: (...args: unknown[]) => void): this {
    const list = this.listeners.get(event) ?? [];
    this.listeners.set(
      event,
      list.filter((l) => l !== listener),
    );
    return this;
  }

  exit(code: number): void {
    this.exitCodes.push(code);
  }

  /** Deliver an event to every registered listener, like a real signal would. */
  emit(event: string, ...args: unknown[]): void {
    for (const listener of this.listeners.get(event) ?? []) {
      listener(...args);
    }
  }

  listenerCount(event: string): number {
    return this.listeners.get(event)?.length ?? 0;
  }
}

describe('installShutdownHandlers', () => {
  const ALL_EVENTS = [
    'exit',
    'uncaughtException',
    'unhandledRejection',
    'SIGINT',
    'SIGTERM',
    'SIGHUP',
  ];

  function install(
    overrides: {
      cleanup?: () => void;
      onShutdown?: (reason: ShutdownReason, code: number) => void;
      writeError?: (message: string) => void;
    } = {},
  ) {
    const target = new FakeProcess();
    const cleanup = overrides.cleanup ?? vi.fn();
    const onShutdown = overrides.onShutdown ?? vi.fn();
    const writeError = overrides.writeError ?? vi.fn();

    const uninstall = installShutdownHandlers({
      cleanup,
      onShutdown,
      writeError,
      target,
    });

    return { target, cleanup, onShutdown, writeError, uninstall };
  }

  it('registers handlers for exit, errors and signals', () => {
    const { target, uninstall } = install();

    for (const event of ALL_EVENTS) {
      expect(target.listenerCount(event)).toBeGreaterThan(0);
    }

    uninstall();
  });

  it('runs cleanup synchronously when the process exits', () => {
    const { target, cleanup, uninstall } = install();

    target.emit('exit');

    expect(cleanup).toHaveBeenCalledTimes(1);
    uninstall();
  });

  it('cleans up and hands signals to onShutdown with conventional codes', () => {
    const cases = [
      ['SIGINT', 130],
      ['SIGTERM', 143],
      ['SIGHUP', 129],
    ] as const;

    for (const [signal, code] of cases) {
      const { target, cleanup, onShutdown, uninstall } = install();

      target.emit(signal);

      expect(cleanup).toHaveBeenCalledTimes(1);
      expect(onShutdown).toHaveBeenCalledWith(signal, code);
      expect(target.exitCodes).toEqual([]); // graceful path, no force exit
      uninstall();
    }
  });

  it('force-exits on a second signal while already shutting down', () => {
    const { target, onShutdown, uninstall } = install();

    target.emit('SIGINT'); // graceful: onShutdown handles it
    target.emit('SIGINT'); // impatience wins: straight to exit

    expect(onShutdown).toHaveBeenCalledTimes(1);
    expect(target.exitCodes).toEqual([130]);
    uninstall();
  });

  it('cleans up and exits non-zero on an uncaught exception', () => {
    const { target, cleanup, onShutdown, writeError, uninstall } = install();

    target.emit('uncaughtException', new Error('kaboom'));

    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(onShutdown).toHaveBeenCalledWith('uncaughtException', 1);
    expect(writeError).toHaveBeenCalledWith(expect.stringContaining('kaboom'));
    uninstall();
  });

  it('cleans up and exits non-zero on an unhandled rejection', () => {
    const { target, cleanup, onShutdown, uninstall } = install();

    target.emit('unhandledRejection', 'nope');

    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(onShutdown).toHaveBeenCalledWith('unhandledRejection', 1);
    uninstall();
  });

  it('a throwing cleanup never prevents the shutdown callback', () => {
    const { target, onShutdown, uninstall } = install({
      cleanup: () => {
        throw new Error('cleanup blew up');
      },
    });

    expect(() => target.emit('SIGTERM')).not.toThrow();
    expect(onShutdown).toHaveBeenCalledWith('SIGTERM', 143);
    uninstall();
  });

  it('exits directly with the signal code when no onShutdown hook is given', () => {
    const target = new FakeProcess();
    const cleanup = vi.fn();

    const uninstall = installShutdownHandlers({ cleanup, target });

    target.emit('SIGTERM');
    expect(target.exitCodes).toEqual([143]);

    uninstall();
  });

  it('uninstall removes every handler it added', () => {
    const { target, uninstall } = install();

    uninstall();

    for (const event of ALL_EVENTS) {
      expect(target.listenerCount(event)).toBe(0);
    }
  });

  it('uninstall is safe to call more than once', () => {
    const { uninstall } = install();
    expect(() => {
      uninstall();
      uninstall();
    }).not.toThrow();
  });
});
