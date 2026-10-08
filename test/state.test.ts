import { describe, it, expect } from 'vitest';

import { createInitialState, reducer } from '../src/app/state.js';
import type { AppState } from '../src/app/state.js';
import { DURATION_CHOICES } from '../src/app/presets.js';
import { HOUR_MS, MINUTE_MS } from '../src/utils/duration.js';
import type { SessionSnapshot } from '../src/services/SessionService.js';
import { IDLE_SESSION } from '../src/services/SessionService.js';

function activeSession(overrides: Partial<SessionSnapshot> = {}): SessionSnapshot {
  return {
    ...IDLE_SESSION,
    status: 'active',
    mode: 'timed',
    startedAt: 1_000,
    endsAt: 1_000 + HOUR_MS,
    durationMs: HOUR_MS,
    remainingMs: HOUR_MS,
    elapsedMs: 0,
    progress: 0,
    ...overrides,
  };
}

describe('createInitialState', () => {
  it('starts on the welcome screen', () => {
    const state = createInitialState();
    expect(state.screen).toBe('WELCOME');
    expect(state.welcomeSeen).toBe(false);
    expect(state.exitCode).toBe(0);
    expect(state.selection).toBeNull();
    expect(state.session).toEqual(IDLE_SESSION);
  });

  it('skips welcome when asked', () => {
    const state = createInitialState({ skipWelcome: true });
    expect(state.screen).toBe('DURATION_SELECTION');
    expect(state.welcomeSeen).toBe(true);
  });

  it('goes straight to PREPARING when a selection is given', () => {
    const state = createInitialState({
      initialSelection: { mode: 'timed', durationMs: 30 * MINUTE_MS },
    });
    expect(state.screen).toBe('PREPARING');
    expect(state.selection?.mode).toBe('timed');
  });

  it('shows the boot error screen with exit code 1', () => {
    const state = createInitialState({
      bootError: { title: 'Nope', message: 'bad', retryable: false },
    });
    expect(state.screen).toBe('ERROR');
    expect(state.exitCode).toBe(1);
    expect(state.error?.title).toBe('Nope');
  });
});

describe('reducer — welcome and navigation', () => {
  it('ADVANCE moves welcome → duration selection', () => {
    const state = reducer(createInitialState(), { type: 'ADVANCE' });
    expect(state.screen).toBe('DURATION_SELECTION');
    expect(state.welcomeSeen).toBe(true);
  });

  it('ADVANCE is a no-op on other screens', () => {
    const state = reducer(createInitialState({ skipWelcome: true }), { type: 'ADVANCE' });
    expect(state.screen).toBe('DURATION_SELECTION');
  });

  it('BACK from duration selection returns to welcome', () => {
    const state = reducer(createInitialState({ skipWelcome: true }), { type: 'BACK' });
    expect(state.screen).toBe('WELCOME');
  });

  it('MOVE wraps around the duration list', () => {
    let state = createInitialState({ skipWelcome: true });
    state = reducer(state, { type: 'MOVE', delta: -1 });
    expect(state.durationIndex).toBe(DURATION_CHOICES.length - 1);

    state = reducer(state, { type: 'MOVE', delta: 1 });
    expect(state.durationIndex).toBe(0);
  });

  it('PICK jumps to an index and wraps', () => {
    let state = createInitialState({ skipWelcome: true });
    state = reducer(state, { type: 'PICK', index: 3 });
    expect(state.durationIndex).toBe(3);

    state = reducer(state, { type: 'PICK', index: 999 });
    expect(state.durationIndex).toBe(999 % DURATION_CHOICES.length);
  });
});

describe('reducer — duration selection and confirmation', () => {
  it('selecting a preset moves to confirmation with the selection stored', () => {
    let state = createInitialState({ skipWelcome: true });
    state = reducer(state, { type: 'PICK', index: 2 }); // 1 hour
    state = reducer(state, { type: 'SELECT' });

    expect(state.screen).toBe('CONFIRMATION');
    expect(state.selection).toEqual({ mode: 'timed', durationMs: HOUR_MS });
    expect(state.confirmIndex).toBe(0);
  });

  it('selecting "custom" opens the custom duration screen', () => {
    const customIndex = DURATION_CHOICES.findIndex((c) => c.kind === 'custom');
    let state = createInitialState({ skipWelcome: true });
    state = reducer(state, { type: 'PICK', index: customIndex });
    state = reducer(state, { type: 'SELECT' });

    expect(state.screen).toBe('CUSTOM_DURATION');
    expect(state.customError).toBeNull();
  });

  it('confirmation "start" moves to PREPARING', () => {
    let state = createInitialState({ skipWelcome: true });
    state = reducer(state, { type: 'PICK', index: 0 });
    state = reducer(state, { type: 'SELECT' });
    state = reducer(state, { type: 'SELECT' }); // confirmIndex 0 = start
    expect(state.screen).toBe('PREPARING');
  });

  it('confirmation "change" returns to duration selection', () => {
    let state = createInitialState({ skipWelcome: true });
    state = reducer(state, { type: 'PICK', index: 0 });
    state = reducer(state, { type: 'SELECT' });
    state = reducer(state, { type: 'MOVE', delta: 1 }); // change
    state = reducer(state, { type: 'SELECT' });
    expect(state.screen).toBe('DURATION_SELECTION');
  });

  it('confirmation "cancel" exits', () => {
    let state = createInitialState({ skipWelcome: true });
    state = reducer(state, { type: 'PICK', index: 0 });
    state = reducer(state, { type: 'SELECT' });
    state = reducer(state, { type: 'MOVE', delta: 2 }); // cancel
    state = reducer(state, { type: 'SELECT' });
    expect(state.screen).toBe('EXIT');
  });

  it('BACK from confirmation returns to duration selection', () => {
    let state = createInitialState({ skipWelcome: true });
    state = reducer(state, { type: 'PICK', index: 1 });
    state = reducer(state, { type: 'SELECT' });
    state = reducer(state, { type: 'BACK' });
    expect(state.screen).toBe('DURATION_SELECTION');
    expect(state.confirmIndex).toBe(0);
  });
});

describe('reducer — custom duration', () => {
  it('SET_CUSTOM stores the value and clears previous errors', () => {
    let state = createInitialState({ skipWelcome: true });
    const customIndex = DURATION_CHOICES.findIndex((c) => c.kind === 'custom');
    state = reducer(state, { type: 'PICK', index: customIndex });
    state = reducer(state, { type: 'SELECT' });
    state = reducer(state, { type: 'CUSTOM_SUBMITTED', selection: null, message: 'bad input' });
    expect(state.customError).toBe('bad input');

    state = reducer(state, { type: 'SET_CUSTOM', value: '1h' });
    expect(state.customValue).toBe('1h');
    expect(state.customError).toBeNull();
  });

  it('successful submit moves to confirmation', () => {
    let state = createInitialState({ skipWelcome: true });
    const customIndex = DURATION_CHOICES.findIndex((c) => c.kind === 'custom');
    state = reducer(state, { type: 'PICK', index: customIndex });
    state = reducer(state, { type: 'SELECT' });
    state = reducer(state, {
      type: 'CUSTOM_SUBMITTED',
      selection: { mode: 'timed', durationMs: 90 * MINUTE_MS },
    });

    expect(state.screen).toBe('CONFIRMATION');
    expect(state.selection).toEqual({ mode: 'timed', durationMs: 90 * MINUTE_MS });
    expect(state.customError).toBeNull();
  });

  it('failed submit keeps the screen and sets an error', () => {
    let state = createInitialState({ skipWelcome: true });
    const customIndex = DURATION_CHOICES.findIndex((c) => c.kind === 'custom');
    state = reducer(state, { type: 'PICK', index: customIndex });
    state = reducer(state, { type: 'SELECT' });
    state = reducer(state, { type: 'CUSTOM_SUBMITTED', selection: null });

    expect(state.screen).toBe('CUSTOM_DURATION');
    expect(state.customError).toBeTruthy();
  });

  it('BACK from custom duration returns to duration selection', () => {
    let state = createInitialState({ skipWelcome: true });
    const customIndex = DURATION_CHOICES.findIndex((c) => c.kind === 'custom');
    state = reducer(state, { type: 'PICK', index: customIndex });
    state = reducer(state, { type: 'SELECT' });
    state = reducer(state, { type: 'BACK' });
    expect(state.screen).toBe('DURATION_SELECTION');
  });
});

describe('reducer — active session', () => {
  function preparing(): AppState {
    let state = createInitialState({ skipWelcome: true });
    state = reducer(state, { type: 'PICK', index: 0 });
    state = reducer(state, { type: 'SELECT' });
    state = reducer(state, { type: 'SELECT' });
    return state;
  }

  it('STARTED moves to the dashboard with session and pid', () => {
    const state = reducer(preparing(), {
      type: 'STARTED',
      session: activeSession(),
      pid: 4242,
    });
    expect(state.screen).toBe('ACTIVE_SESSION');
    expect(state.pid).toBe(4242);
    expect(state.session.status).toBe('active');
    expect(state.error).toBeNull();
  });

  it('START_FAILED shows the error screen', () => {
    const state = reducer(preparing(), {
      type: 'START_FAILED',
      error: { title: 'Boom', message: 'spawn failed', retryable: true },
    });
    expect(state.screen).toBe('ERROR');
    expect(state.error?.title).toBe('Boom');
  });

  it('TICK updates the session while active', () => {
    let state = reducer(preparing(), { type: 'STARTED', session: activeSession(), pid: 1 });
    state = reducer(state, {
      type: 'TICK',
      session: activeSession({
        elapsedMs: 60_000,
        remainingMs: HOUR_MS - 60_000,
        progress: 1 / 60,
      }),
    });
    expect(state.screen).toBe('ACTIVE_SESSION');
    expect(state.session.elapsedMs).toBe(60_000);
  });

  it('TICK with an expired session completes the run', () => {
    let state = reducer(preparing(), { type: 'STARTED', session: activeSession(), pid: 1 });
    state = reducer(state, {
      type: 'TICK',
      session: activeSession({ status: 'expired', remainingMs: 0, progress: 1 }),
    });

    expect(state.screen).toBe('COMPLETED');
    expect(state.completion).toBe('expired');
    expect(state.pid).toBeUndefined();
    expect(state.notices.at(-1)?.tone).toBe('success');
  });

  it('TICK is ignored outside the active session', () => {
    const state = reducer(createInitialState({ skipWelcome: true }), {
      type: 'TICK',
      session: activeSession(),
    });
    expect(state.screen).toBe('DURATION_SELECTION');
    expect(state.session).toEqual(IDLE_SESSION);
  });
});

describe('reducer — stop flow', () => {
  function active(): AppState {
    let state = createInitialState({ skipWelcome: true });
    state = reducer(state, { type: 'PICK', index: 0 });
    state = reducer(state, { type: 'SELECT' });
    state = reducer(state, { type: 'SELECT' });
    state = reducer(state, { type: 'STARTED', session: activeSession(), pid: 99 });
    return state;
  }

  it('STOP_REQUESTED opens the stop confirmation', () => {
    const state = reducer(active(), { type: 'STOP_REQUESTED' });
    expect(state.screen).toBe('STOP_CONFIRMATION');
    expect(state.stopIndex).toBe(0);
  });

  it('STOP_CANCELLED returns to the dashboard', () => {
    let state = reducer(active(), { type: 'STOP_REQUESTED' });
    state = reducer(state, { type: 'STOP_CANCELLED' });
    expect(state.screen).toBe('ACTIVE_SESSION');
  });

  it('STOP_CONFIRMED moves to STOPPING', () => {
    let state = reducer(active(), { type: 'STOP_REQUESTED' });
    state = reducer(state, { type: 'STOP_CONFIRMED' });
    expect(state.screen).toBe('STOPPING');
  });

  it('STOPPED completes the run with a stopped reason', () => {
    let state = reducer(active(), { type: 'STOP_REQUESTED' });
    state = reducer(state, { type: 'STOP_CONFIRMED' });
    state = reducer(state, {
      type: 'STOPPED',
      session: activeSession({ status: 'stopped' }),
    });

    expect(state.screen).toBe('COMPLETED');
    expect(state.completion).toBe('stopped');
    expect(state.pid).toBeUndefined();
    expect(state.notices.at(-1)?.tone).toBe('success');
  });

  it('selecting "No, keep it running" in stop confirmation returns to dashboard', () => {
    let state = reducer(active(), { type: 'STOP_REQUESTED' });
    state = reducer(state, { type: 'MOVE', delta: 1 }); // cancel choice
    state = reducer(state, { type: 'SELECT' });
    expect(state.screen).toBe('ACTIVE_SESSION');
  });

  it('selecting "Yes, stop session" confirms the stop', () => {
    let state = reducer(active(), { type: 'STOP_REQUESTED' });
    state = reducer(state, { type: 'SELECT' }); // confirm choice
    expect(state.screen).toBe('STOPPING');
  });
});

describe('reducer — completion and restart', () => {
  function completed(): AppState {
    let state = createInitialState({ skipWelcome: true });
    state = reducer(state, { type: 'PICK', index: 0 });
    state = reducer(state, { type: 'SELECT' });
    state = reducer(state, { type: 'SELECT' });
    state = reducer(state, { type: 'STARTED', session: activeSession(), pid: 7 });
    state = reducer(state, { type: 'STOP_REQUESTED' });
    state = reducer(state, { type: 'STOP_CONFIRMED' });
    state = reducer(state, { type: 'STOPPED', session: activeSession({ status: 'stopped' }) });
    return state;
  }

  it('"Start another session" restarts the wizard', () => {
    const state = reducer(completed(), { type: 'SELECT' }); // completedIndex 0 = again
    expect(state.screen).toBe('DURATION_SELECTION');
    expect(state.selection).toBeNull();
    expect(state.session).toEqual(IDLE_SESSION);
    expect(state.completion).toBeNull();
    expect(state.pid).toBeUndefined();
  });

  it('"Exit" leaves the app', () => {
    let state = completed();
    state = reducer(state, { type: 'MOVE', delta: 1 }); // exit
    state = reducer(state, { type: 'SELECT' });
    expect(state.screen).toBe('EXIT');
  });

  it('UNEXPECTED_EXIT completes with the unexpected reason', () => {
    let state = createInitialState({ skipWelcome: true });
    state = reducer(state, { type: 'PICK', index: 0 });
    state = reducer(state, { type: 'SELECT' });
    state = reducer(state, { type: 'SELECT' });
    state = reducer(state, { type: 'STARTED', session: activeSession(), pid: 3 });

    state = reducer(state, { type: 'UNEXPECTED_EXIT' });
    expect(state.screen).toBe('COMPLETED');
    expect(state.completion).toBe('unexpected');
    expect(state.notices.at(-1)?.tone).toBe('warn');
  });
});

describe('reducer — errors and quitting', () => {
  it('RETRY on a retryable error with a selection goes back to PREPARING', () => {
    let state = createInitialState({
      initialSelection: { mode: 'timed', durationMs: MINUTE_MS },
    });
    state = reducer(state, {
      type: 'START_FAILED',
      error: { title: 'x', message: 'y', retryable: true },
    });
    expect(state.screen).toBe('ERROR');

    state = reducer(state, { type: 'RETRY' });
    expect(state.screen).toBe('PREPARING');
    expect(state.error).toBeNull();
  });

  it('RETRY on a fatal error exits with code 1', () => {
    let state = createInitialState({ skipWelcome: true });
    state = reducer(state, {
      type: 'START_FAILED',
      error: { title: 'x', message: 'y', retryable: false },
    });
    state = reducer(state, { type: 'RETRY' });
    expect(state.screen).toBe('EXIT');
    expect(state.exitCode).toBe(1);
  });

  it('BACK from a fatal error exits with code 1', () => {
    let state = createInitialState({
      bootError: { title: 'x', message: 'y', retryable: false },
    });
    state = reducer(state, { type: 'BACK' });
    expect(state.screen).toBe('EXIT');
    expect(state.exitCode).toBe(1);
  });

  it('QUIT always goes to EXIT', () => {
    const state = reducer(createInitialState(), { type: 'QUIT' });
    expect(state.screen).toBe('EXIT');
  });

  it('ADD_NOTICE appends with incrementing ids', () => {
    let state = createInitialState();
    state = reducer(state, { type: 'ADD_NOTICE', text: 'one', tone: 'info' });
    state = reducer(state, { type: 'ADD_NOTICE', text: 'two', tone: 'warn' });
    expect(state.notices.map((n) => n.text)).toEqual(['one', 'two']);
    const [first, second] = state.notices;
    if (first === undefined || second === undefined) throw new Error('notices missing');
    expect(second.id).toBeGreaterThan(first.id);
  });
});
