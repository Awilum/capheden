import { describe, it, expect } from 'vitest';

import {
  formatClockDuration,
  formatRemainingSpelled,
  formatClockTime,
  computeCountdown,
  sessionLengthMs,
  formatElapsed,
} from '../src/utils/time.js';
import { HOUR_MS, MINUTE_MS, SECOND_MS, DAY_MS } from '../src/utils/duration.js';

describe('formatClockDuration', () => {
  it('formats hours, minutes and seconds', () => {
    expect(formatClockDuration(HOUR_MS + 30 * MINUTE_MS + 5 * SECOND_MS)).toBe('01:30:05');
  });

  it('formats a zero duration', () => {
    expect(formatClockDuration(0)).toBe('00:00:00');
  });

  it('never shows negative time', () => {
    expect(formatClockDuration(-5_000)).toBe('00:00:00');
  });

  it('shows the infinity symbol for infinite time', () => {
    expect(formatClockDuration(Number.POSITIVE_INFINITY)).toBe('∞');
    expect(formatClockDuration(Number.NEGATIVE_INFINITY)).toBe('∞');
  });

  it('floors partial seconds', () => {
    expect(formatClockDuration(1_999)).toBe('00:00:01');
  });

  it('rolls minutes into hours', () => {
    expect(formatClockDuration(60 * MINUTE_MS)).toBe('01:00:00');
  });
});

describe('formatRemainingSpelled', () => {
  it('formats sub-hour durations in minutes', () => {
    expect(formatRemainingSpelled(45 * MINUTE_MS)).toBe('45 minutes');
    expect(formatRemainingSpelled(1 * MINUTE_MS)).toBe('1 minute');
  });

  it('formats hours with leftover minutes', () => {
    expect(formatRemainingSpelled(HOUR_MS + 5 * MINUTE_MS)).toBe('1 hour 5 minutes');
    expect(formatRemainingSpelled(2 * HOUR_MS)).toBe('2 hours');
  });

  it('says no limit for infinity', () => {
    expect(formatRemainingSpelled(Number.POSITIVE_INFINITY)).toBe('no limit');
  });

  it('never returns a negative count', () => {
    expect(formatRemainingSpelled(-1)).toBe('0 minutes');
  });
});

describe('formatClockTime', () => {
  it('formats a 24-hour wall clock time', () => {
    const timestamp = new Date(2026, 0, 1, 9, 5).getTime();
    expect(formatClockTime(timestamp)).toBe('09:05');
  });

  it('pads single digits', () => {
    const timestamp = new Date(2026, 0, 1, 0, 0).getTime();
    expect(formatClockTime(timestamp)).toBe('00:00');
  });
});

describe('computeCountdown', () => {
  const startedAt = 1_000_000;

  it('counts down a timed session', () => {
    const countdown = computeCountdown({
      startedAt,
      endsAt: startedAt + HOUR_MS,
      now: startedAt + 30 * MINUTE_MS,
    });

    expect(countdown.remainingMs).toBe(30 * MINUTE_MS);
    expect(countdown.elapsedMs).toBe(30 * MINUTE_MS);
    expect(countdown.progress).toBe(0.5);
    expect(countdown.isExpired).toBe(false);
  });

  it('expires exactly when the end time is reached', () => {
    const countdown = computeCountdown({
      startedAt,
      endsAt: startedAt + MINUTE_MS,
      now: startedAt + MINUTE_MS,
    });

    expect(countdown.remainingMs).toBe(0);
    expect(countdown.isExpired).toBe(true);
    expect(countdown.progress).toBe(1);
  });

  it('stays expired and clamped after the end time', () => {
    const countdown = computeCountdown({
      startedAt,
      endsAt: startedAt + MINUTE_MS,
      now: startedAt + HOUR_MS,
    });

    expect(countdown.remainingMs).toBe(0);
    expect(countdown.elapsedMs).toBe(HOUR_MS);
    expect(countdown.progress).toBe(1);
    expect(countdown.isExpired).toBe(true);
  });

  it('never goes negative when the clock runs backwards', () => {
    const countdown = computeCountdown({
      startedAt,
      endsAt: startedAt + HOUR_MS,
      now: startedAt - 5_000,
    });

    expect(countdown.elapsedMs).toBe(0);
    expect(countdown.remainingMs).toBe(HOUR_MS + 5_000);
    expect(countdown.isExpired).toBe(false);
  });

  it('treats an indefinite session as infinite', () => {
    const countdown = computeCountdown({ startedAt, endsAt: null, now: startedAt + HOUR_MS });

    expect(countdown.remainingMs).toBe(Number.POSITIVE_INFINITY);
    expect(countdown.elapsedMs).toBe(HOUR_MS);
    expect(countdown.progress).toBe(0);
    expect(countdown.isExpired).toBe(false);
  });

  it('handles a session that has not started', () => {
    const countdown = computeCountdown({ startedAt: null, endsAt: null, now: 42 });

    expect(countdown.remainingMs).toBe(0);
    expect(countdown.elapsedMs).toBe(0);
    expect(countdown.progress).toBe(0);
    expect(countdown.isExpired).toBe(false);
  });
});

describe('sessionLengthMs', () => {
  it('returns the span of a timed session', () => {
    expect(sessionLengthMs(0, HOUR_MS)).toBe(HOUR_MS);
  });

  it('returns null without an end time', () => {
    expect(sessionLengthMs(0, null)).toBeNull();
  });

  it('returns null without a start time', () => {
    expect(sessionLengthMs(null, HOUR_MS)).toBeNull();
  });
});

describe('formatElapsed', () => {
  it('uses clock format below one day', () => {
    expect(formatElapsed(HOUR_MS + SECOND_MS)).toBe('01:00:01');
  });

  it('uses day format for long sessions', () => {
    expect(formatElapsed(DAY_MS + 2 * HOUR_MS)).toBe('1d 02h');
  });
});
