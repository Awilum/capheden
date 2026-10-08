import { describe, it, expect } from 'vitest';
import { createElement } from 'react';
import { render } from 'ink-testing-library';

import { App } from '../src/app/App.js';
import { createRuntime } from '../src/app/runtime.js';
import { CaffeinateService } from '../src/services/CaffeinateService.js';
import { SessionService } from '../src/services/SessionService.js';
import { FakeChild, makeSpawn } from './helpers/fake.js';

const ENTER = '\r';
const ESC = '\u001B';
const DOWN = '\u001B[B';
const UP = '\u001B[A';

/** Let queued microtasks and Ink's input pipeline settle. */
function settle(ms = 20): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface Harness {
  readonly result: ReturnType<typeof render>;
  readonly child: FakeChild;
  readonly frame: () => string;
  readonly press: (...keys: string[]) => Promise<void>;
}

async function boot(options: { skipWelcome?: boolean } = {}): Promise<Harness> {
  const child = new FakeChild();
  const { spawn } = makeSpawn(child);
  const runtime = createRuntime({
    caffeinate: new CaffeinateService({ spawn }),
    session: new SessionService(),
  });

  const result = render(createElement(App, { runtime, skipWelcome: options.skipWelcome ?? true }));

  await settle();

  return {
    result,
    child,
    frame: () => result.lastFrame() ?? '',
    press: async (...keys) => {
      for (const key of keys) {
        result.stdin.write(key);
        await settle(10);
      }
    },
  };
}

describe('App — wizard flow', () => {
  it('renders the duration wizard when the welcome is skipped', async () => {
    const h = await boot();

    expect(h.frame()).toContain('15 minutes');
    expect(h.frame()).toContain('Until I stop it');
    h.result.unmount();
  });

  it('confirms a preset duration and starts a session', async () => {
    const h = await boot();

    // 15 minutes is the default highlight; Enter opens the confirmation.
    await h.press(ENTER);
    expect(h.frame()).toContain('15 minutes');

    // Enter on "Start session" → PREPARING → ACTIVE_SESSION.
    await h.press(ENTER);
    await settle(30);

    expect(h.frame()).toMatch(/AWAKE/);
    expect(h.child.signals).toEqual([]); // spawn only; never killed yet
    h.result.unmount();
  });

  it('navigates the list with arrow keys and wraps', async () => {
    const h = await boot();

    await h.press(UP);
    // Wrapping up from the first row lands on "Custom duration".
    expect(h.frame()).toContain('Custom duration');

    await h.press(DOWN);
    expect(h.frame()).toContain('15 minutes');
    h.result.unmount();
  });

  it('opens the custom duration screen and validates input', async () => {
    const h = await boot();

    // Move to the last row ("Custom duration") and open it.
    for (let i = 0; i < 7; i++) {
      await h.press(DOWN);
    }
    await h.press(ENTER);
    expect(h.frame()).toContain('How long should your Mac stay awake?');

    // Keystrokes must accumulate one at a time, like a real terminal delivers.
    await h.press('1', 'h');
    expect(h.frame()).toContain('1h');
    expect(h.frame()).toMatch(/That is 1 hour/);

    // Backspace erases the last character instead of navigating back.
    await h.press('\u007F');
    expect(h.frame()).toContain('1');

    // Garbage input must be rejected with a visible error.
    await h.press('x', 'y');
    await h.press(ENTER);
    expect(h.frame()).toMatch(/don't understand/i);

    // A valid duration moves on to confirmation (90m = 1 hour 30 minutes).
    await h.press('\u007F', '\u007F', '\u007F'); // clear "1xy"
    await h.press('9', '0', 'm');
    await h.press(ENTER);
    await settle();
    expect(h.frame()).toContain('1 hour 30 minutes');

    h.result.unmount();
  });

  it('esc goes back from confirmation to the list', async () => {
    const h = await boot();

    await h.press(ENTER); // → confirmation
    expect(h.frame()).toMatch(/start/i);

    await h.press(ESC); // back to duration selection
    expect(h.frame()).toContain('15 minutes');
    h.result.unmount();
  });
});

describe('App — session lifecycle', () => {
  it('starts, stops on "s" confirmation, and reaches the completion screen', async () => {
    const h = await boot();

    await h.press(ENTER, ENTER); // select 15m → start
    await settle(30);
    expect(h.frame()).toMatch(/AWAKE/);

    // "s" opens the stop confirmation.
    await h.press('s');
    expect(h.frame()).toMatch(/stop/i);

    // Confirm the stop → STOPPING → COMPLETED.
    await h.press(ENTER);
    await settle(40);

    expect(h.frame()).toMatch(/start another session/i);
    expect(h.child.signals).toContain('SIGTERM');
    h.result.unmount();
  });

  it('cancelling the stop keeps the session running', async () => {
    const h = await boot();

    await h.press(ENTER, ENTER);
    await settle(30);

    await h.press('s');
    await h.press(ESC); // "esc = keep it running"
    await settle(20);

    expect(h.frame()).toMatch(/AWAKE/);
    expect(h.child.signals).toEqual([]);
    h.result.unmount();
  });

  it('quitting with q stops caffeinate so nothing is orphaned', async () => {
    const h = await boot();

    await h.press(ENTER, ENTER);
    await settle(30);
    expect(h.frame()).toMatch(/AWAKE/);

    await h.press('q');
    await settle(30);

    // Quitting uses the synchronous cleanup path, which SIGKILLs the child so
    // no caffeinate can ever outlive the app.
    expect(h.child.signals).toContain('SIGKILL');
    expect(h.result.lastFrame() ?? '').not.toMatch(/AWAKE/);
    h.result.unmount();
  });

  it('treats an unexpected caffeinate exit as a completed run', async () => {
    const h = await boot();

    await h.press(ENTER, ENTER);
    await settle(30);
    expect(h.frame()).toMatch(/AWAKE/);

    h.child.exitNormally(1);
    await settle(30);

    expect(h.frame()).toMatch(/caffeinate exited unexpectedly/i);
    h.result.unmount();
  });

  it('shows the indefinite session mode', async () => {
    const h = await boot();

    // "Until I stop it" is the 7th row.
    for (let i = 0; i < 6; i++) {
      await h.press(DOWN);
    }
    await h.press(ENTER, ENTER);
    await settle(30);

    expect(h.frame()).toMatch(/AWAKE/);
    expect(h.frame()).toMatch(/Until stopped/i);
    h.result.unmount();
  });
});
