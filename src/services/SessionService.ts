/**
 * Session bookkeeping, deliberately free of React and of `child_process` so it
 * can be unit tested with a fake clock.
 *
 * `CaffeinateService` owns the OS process; `SessionService` owns the truth
 * about what the user is seeing on screen.
 */
export type SessionMode = 'timed' | 'indefinite';
export type SessionStatus = 'idle' | 'active' | 'stopped' | 'expired';

/** What the user picked, either in the wizard or on the command line. */
export type SessionSelection =
  { readonly mode: 'indefinite' } | { readonly mode: 'timed'; readonly durationMs: number };

export interface SessionSnapshot {
  readonly status: SessionStatus;
  readonly mode: SessionMode;
  readonly startedAt: number | null;
  readonly endsAt: number | null;
  readonly durationMs: number | null;
  /** `Infinity` while an indefinite session is running. */
  readonly remainingMs: number;
  readonly elapsedMs: number;
  /** 0 → 1. Always 0 for indefinite sessions. */
  readonly progress: number;
}

export const IDLE_SESSION: SessionSnapshot = {
  status: 'idle',
  mode: 'timed',
  startedAt: null,
  endsAt: null,
  durationMs: null,
  remainingMs: 0,
  elapsedMs: 0,
  progress: 0,
};

export interface SessionServiceOptions {
  readonly now?: () => number;
}

export class SessionService {
  #snapshot: SessionSnapshot = IDLE_SESSION;
  readonly #now: () => number;

  constructor(options: SessionServiceOptions = {}) {
    this.#now = options.now ?? Date.now;
  }

  getSnapshot(): SessionSnapshot {
    return this.#snapshot;
  }

  /** Begin a session. Any previous session is forgotten. */
  start(selection: SessionSelection, startedAt: number = this.#now()): SessionSnapshot {
    const isIndefinite = selection.mode === 'indefinite';
    const durationMs = isIndefinite ? null : (selection as { durationMs: number }).durationMs;

    this.#snapshot = {
      status: 'active',
      mode: isIndefinite ? 'indefinite' : 'timed',
      startedAt,
      endsAt: isIndefinite ? null : startedAt + (durationMs ?? 0),
      durationMs,
      remainingMs: isIndefinite ? Number.POSITIVE_INFINITY : (durationMs ?? 0),
      elapsedMs: 0,
      progress: 0,
    };

    return this.#snapshot;
  }

  /**
   * Recompute the snapshot for `now`. A timed session that reaches zero flips
   * to `expired` exactly once.
   */
  tick(now: number = this.#now()): SessionSnapshot {
    const snapshot = this.#snapshot;

    if (snapshot.status !== 'active' || snapshot.startedAt === null) {
      return snapshot;
    }

    if (snapshot.endsAt === null) {
      this.#snapshot = { ...snapshot, elapsedMs: Math.max(0, now - snapshot.startedAt) };
      return this.#snapshot;
    }

    const totalMs = Math.max(1, snapshot.endsAt - snapshot.startedAt);
    const elapsedMs = Math.max(0, now - snapshot.startedAt);
    const remainingMs = Math.max(0, snapshot.endsAt - now);

    this.#snapshot = {
      ...snapshot,
      status: remainingMs <= 0 ? 'expired' : 'active',
      remainingMs,
      elapsedMs: Math.min(elapsedMs, totalMs),
      progress: Math.min(1, elapsedMs / totalMs),
    };

    return this.#snapshot;
  }

  /** Mark a running session as stopped by the user. */
  stop(): SessionSnapshot {
    const snapshot = this.#snapshot;

    if (snapshot.status !== 'active') {
      return snapshot;
    }

    this.#snapshot = { ...snapshot, status: 'stopped' };
    return this.#snapshot;
  }

  /** Back to a clean slate, e.g. after a session finished. */
  reset(): SessionSnapshot {
    this.#snapshot = IDLE_SESSION;
    return this.#snapshot;
  }

  isActive(): boolean {
    return this.#snapshot.status === 'active';
  }
}

/** Duration in ms for a selection, or `null` when it runs until stopped. */
export function selectionDurationMs(selection: SessionSelection): number | null {
  return selection.mode === 'indefinite' ? null : selection.durationMs;
}
