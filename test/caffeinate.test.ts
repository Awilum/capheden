import { describe, it, expect, vi } from 'vitest';

import { CaffeinateService, CaffeinateError } from '../src/services/CaffeinateService.js';
import { MINUTE_MS } from '../src/utils/duration.js';
import { FakeChild, makeSpawn } from './helpers/fake.js';

describe('CaffeinateService.buildArgs', () => {
  it('builds a idle-assertion session with no timer by default', () => {
    const service = new CaffeinateService({ spawn: makeSpawn(new FakeChild()).spawn });
    expect(service.buildArgs()).toEqual(['-i']);
  });

  it('adds -d for display assertion', () => {
    const service = new CaffeinateService({ spawn: makeSpawn(new FakeChild()).spawn });
    expect(service.buildArgs({ preventDisplaySleep: true })).toEqual(['-i', '-d']);
  });

  it('adds -t with whole seconds for a timed session', () => {
    const service = new CaffeinateService({ spawn: makeSpawn(new FakeChild()).spawn });
    expect(service.buildArgs({ durationMs: 30 * MINUTE_MS })).toEqual(['-i', '-t', '1800']);
  });

  it('never passes a zero or negative timeout to caffeinate', () => {
    const service = new CaffeinateService({ spawn: makeSpawn(new FakeChild()).spawn });
    expect(service.buildArgs({ durationMs: 0 })).toEqual(['-i', '-t', '1']);
    expect(service.buildArgs({ durationMs: -5 })).toEqual(['-i', '-t', '1']);
  });

  it('rounds fractional seconds', () => {
    const service = new CaffeinateService({ spawn: makeSpawn(new FakeChild()).spawn });
    expect(service.buildArgs({ durationMs: 1_500 })).toEqual(['-i', '-t', '2']);
  });
});

describe('CaffeinateService.start', () => {
  it('spawns caffeinate with the expected binary and arguments', async () => {
    const child = new FakeChild();
    const { spawn, calls } = makeSpawn(child);
    const service = new CaffeinateService({ spawn, binaryPath: '/usr/bin/caffeinate' });

    const result = await service.start({ durationMs: MINUTE_MS });

    expect(calls).toHaveLength(1);
    const call = calls.at(0);
    expect(call).toBeDefined();
    if (call === undefined) throw new Error('spawn was not called');
    expect(call.command).toBe('/usr/bin/caffeinate');
    expect(call.args).toEqual(['-i', '-t', '60']);
    expect(call.options.stdio).toBe('ignore');
    expect(result.pid).toBe(12_345);
    expect(result.durationMs).toBe(MINUTE_MS);
    expect(service.isRunning()).toBe(true);
    expect(service.getPid()).toBe(12_345);
  });

  it('refuses to start a second session while one is running', async () => {
    const child = new FakeChild();
    const service = new CaffeinateService({ spawn: makeSpawn(child).spawn });

    await service.start();
    await expect(service.start()).rejects.toThrow(CaffeinateError);
    await expect(service.start()).rejects.toThrow(/already brewing/);
  });

  it('wraps a synchronous spawn failure', async () => {
    const { spawn } = makeSpawn(new FakeChild(), 'throw');
    const service = new CaffeinateService({ spawn, binaryPath: '/usr/bin/caffeinate' });

    await expect(service.start()).rejects.toThrow(/Could not start caffeinate/);
    expect(service.isRunning()).toBe(false);
  });

  it('reports a missing binary with a friendly message', async () => {
    const { spawn } = makeSpawn(new FakeChild(), 'async-error', 'ENOENT');
    const service = new CaffeinateService({ spawn, binaryPath: '/nope/caffeinate' });

    await expect(service.start()).rejects.toThrow(
      /Could not find caffeinate at \/nope\/caffeinate/,
    );
    expect(service.isRunning()).toBe(false);
  });

  it('reports a permission failure clearly', async () => {
    const { spawn } = makeSpawn(new FakeChild(), 'async-error', 'EACCES');
    const service = new CaffeinateService({ spawn, binaryPath: '/nope/caffeinate' });

    await expect(service.start()).rejects.toThrow(/Not allowed to run/);
    expect(service.isRunning()).toBe(false);
  });

  it('notifies on unexpected exit', async () => {
    const child = new FakeChild();
    const service = new CaffeinateService({ spawn: makeSpawn(child).spawn });
    const onUnexpectedExit = vi.fn();

    await service.start({ onUnexpectedExit });
    expect(onUnexpectedExit).not.toHaveBeenCalled();

    child.exitNormally(1);
    expect(onUnexpectedExit).toHaveBeenCalledTimes(1);
    expect(onUnexpectedExit).toHaveBeenCalledWith({ code: 1, signal: null });
    expect(service.isRunning()).toBe(false);
    expect(service.getProcess()).toBeNull();
  });
});

describe('CaffeinateService.stop', () => {
  it('terminates the child and reports it was not already stopped', async () => {
    const child = new FakeChild();
    const service = new CaffeinateService({ spawn: makeSpawn(child).spawn });
    const onUnexpectedExit = vi.fn();

    await service.start({ onUnexpectedExit });
    const result = await service.stop();

    expect(result).toEqual({ alreadyStopped: false, forced: false });
    expect(child.signals).toEqual(['SIGTERM']);
    expect(service.isRunning()).toBe(false);
    // A requested stop must NOT be reported as an unexpected exit.
    expect(onUnexpectedExit).not.toHaveBeenCalled();
  });

  it('is idempotent: stopping again reports alreadyStopped', async () => {
    const child = new FakeChild();
    const service = new CaffeinateService({ spawn: makeSpawn(child).spawn });

    await service.start();
    await service.stop();
    const second = await service.stop();

    expect(second).toEqual({ alreadyStopped: true, forced: false });
    // The child was signalled exactly once overall.
    expect(child.signals.filter((s) => s === 'SIGTERM')).toHaveLength(1);
  });

  it('escalates to SIGKILL when the child ignores SIGTERM', async () => {
    const child = new FakeChild({ ignoreSigterm: true });
    const service = new CaffeinateService({ spawn: makeSpawn(child).spawn });

    await service.start();
    const result = await service.stop({ timeoutMs: 20 });

    expect(result.forced).toBe(true);
    expect(child.signals).toContain('SIGTERM');
    expect(child.signals).toContain('SIGKILL');
    expect(service.isRunning()).toBe(false);
  }, 5_000);

  it('stop on a service that never started is a no-op', async () => {
    const service = new CaffeinateService({ spawn: makeSpawn(new FakeChild()).spawn });
    const result = await service.stop();
    expect(result).toEqual({ alreadyStopped: true, forced: false });
  });

  it('stop after the child already exited is a no-op', async () => {
    const child = new FakeChild();
    const service = new CaffeinateService({ spawn: makeSpawn(child).spawn });

    await service.start();
    child.exitNormally(0);

    const result = await service.stop();
    expect(result).toEqual({ alreadyStopped: true, forced: false });
  });
});

describe('CaffeinateService.cleanup', () => {
  it('kills the child synchronously', async () => {
    const child = new FakeChild();
    const service = new CaffeinateService({ spawn: makeSpawn(child).spawn });

    await service.start();
    service.cleanup();

    expect(child.signals).toContain('SIGKILL');
    expect(service.isRunning()).toBe(false);
  });

  it('is idempotent', async () => {
    const child = new FakeChild();
    const service = new CaffeinateService({ spawn: makeSpawn(child).spawn });

    await service.start();
    service.cleanup();
    service.cleanup();
    service.cleanup();

    expect(child.signals.filter((s) => s === 'SIGKILL')).toHaveLength(1);
    expect(service.getProcess()).toBeNull();
  });

  it('is safe when nothing ever started', () => {
    const service = new CaffeinateService({ spawn: makeSpawn(new FakeChild()).spawn });
    expect(() => service.cleanup()).not.toThrow();
    expect(service.isRunning()).toBe(false);
  });
});

describe('CaffeinateService isRunning', () => {
  it('false before start', () => {
    const service = new CaffeinateService({ spawn: makeSpawn(new FakeChild()).spawn });
    expect(service.isRunning()).toBe(false);
    expect(service.getProcess()).toBeNull();
    expect(service.getPid()).toBeUndefined();
  });

  it('true after start, false after the child exits', async () => {
    const child = new FakeChild();
    const service = new CaffeinateService({ spawn: makeSpawn(child).spawn });

    await service.start();
    expect(service.isRunning()).toBe(true);

    child.exitNormally(0);
    expect(service.isRunning()).toBe(false);
  });

  it('reports the configured binary path', () => {
    const service = new CaffeinateService({
      spawn: makeSpawn(new FakeChild()).spawn,
      binaryPath: '/custom/caffeinate',
    });
    expect(service.getBinaryPath()).toBe('/custom/caffeinate');
  });
});
