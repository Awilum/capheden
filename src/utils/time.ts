import { DAY_MS, HOUR_MS, MINUTE_MS, SECOND_MS } from './duration.js';

const pad = (value: number, length = 2): string => String(value).padStart(length, '0');

/**
 * Countdown style clock, e.g. `01:47:32`. Always hours → minutes → seconds so
 * the digits never jump around while the timer is running.
 */
export function formatClockDuration(ms: number): string {
  if (!Number.isFinite(ms)) return '∞';

  const totalSeconds = Math.max(0, Math.floor(ms / SECOND_MS));
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/** Human remaining/elapsed label: `1 hour 5 minutes remaining`. */
export function formatRemainingSpelled(ms: number): string {
  if (!Number.isFinite(ms)) return 'no limit';

  const totalMinutes = Math.ceil(Math.max(0, ms) / MINUTE_MS);
  if (totalMinutes < 60) {
    return `${totalMinutes} ${totalMinutes === 1 ? 'minute' : 'minutes'}`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const hourPart = `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  return minutes === 0 ? hourPart : `${hourPart} ${minutes} minutes`;
}

/** 24-hour wall clock time, e.g. `14:32`. */
export function formatClockTime(timestamp: number): string {
  const date = new Date(timestamp);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** 24-hour wall clock time including seconds, e.g. `14:32:07`. */
export function formatClockTimePrecise(timestamp: number): string {
  const date = new Date(timestamp);
  return `${formatClockTime(timestamp)}:${pad(date.getSeconds())}`;
}

export interface CountdownInput {
  readonly startedAt: number | null;
  readonly endsAt: number | null;
  readonly now: number;
}

export interface Countdown {
  /** Milliseconds left, `Infinity` for an indefinite session. */
  readonly remainingMs: number;
  readonly elapsedMs: number;
  /** 0 → 1, always 0 for indefinite sessions. */
  readonly progress: number;
  readonly isExpired: boolean;
}

/** Pure countdown maths. Timestamp based, so it stays correct across tab sleep. */
export function computeCountdown({ startedAt, endsAt, now }: CountdownInput): Countdown {
  if (startedAt === null) {
    return { remainingMs: 0, elapsedMs: 0, progress: 0, isExpired: false };
  }

  const elapsedMs = Math.max(0, now - startedAt);

  if (endsAt === null) {
    return { remainingMs: Number.POSITIVE_INFINITY, elapsedMs, progress: 0, isExpired: false };
  }

  const remainingMs = Math.max(0, endsAt - now);
  const totalMs = endsAt - startedAt;
  const progress = totalMs > 0 ? Math.min(1, Math.max(0, elapsedMs / totalMs)) : 1;

  return { remainingMs, elapsedMs, progress, isExpired: remainingMs <= 0 };
}

/** Total session length in ms, or `null` for indefinite sessions. */
export function sessionLengthMs(startedAt: number | null, endsAt: number | null): number | null {
  if (startedAt === null || endsAt === null) return null;
  return Math.max(0, endsAt - startedAt);
}

/** How long a session of `totalMs` has been running, formatted for the dashboard. */
export function formatElapsed(elapsedMs: number): string {
  if (elapsedMs >= DAY_MS) {
    const days = Math.floor(elapsedMs / DAY_MS);
    const hours = Math.floor((elapsedMs % DAY_MS) / HOUR_MS);
    return `${days}d ${pad(hours)}h`;
  }

  return formatClockDuration(elapsedMs);
}
