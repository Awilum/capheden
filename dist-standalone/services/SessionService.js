export const IDLE_SESSION = {
  status: 'idle',
  mode: 'timed',
  startedAt: null,
  endsAt: null,
  durationMs: null,
  remainingMs: 0,
  elapsedMs: 0,
  progress: 0,
};
export class SessionService {
  #snapshot = IDLE_SESSION;
  #now;
  constructor(options = {}) {
    this.#now = options.now ?? Date.now;
  }
  getSnapshot() {
    return this.#snapshot;
  }
  /** Begin a session. Any previous session is forgotten. */
  start(selection, startedAt = this.#now()) {
    const isIndefinite = selection.mode === 'indefinite';
    const durationMs = isIndefinite ? null : selection.durationMs;
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
  tick(now = this.#now()) {
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
  stop() {
    const snapshot = this.#snapshot;
    if (snapshot.status !== 'active') {
      return snapshot;
    }
    this.#snapshot = { ...snapshot, status: 'stopped' };
    return this.#snapshot;
  }
  /** Back to a clean slate, e.g. after a session finished. */
  reset() {
    this.#snapshot = IDLE_SESSION;
    return this.#snapshot;
  }
  isActive() {
    return this.#snapshot.status === 'active';
  }
}
/** Duration in ms for a selection, or `null` when it runs until stopped. */
export function selectionDurationMs(selection) {
  return selection.mode === 'indefinite' ? null : selection.durationMs;
}
//# sourceMappingURL=SessionService.js.map
