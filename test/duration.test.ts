import { describe, it, expect } from 'vitest';
import {
  parseDuration,
  validateDuration,
  formatCompact,
  formatSpelled,
  MIN_DURATION_MS,
  MAX_DURATION_MS,
  MINUTE_MS,
  HOUR_MS,
  DAY_MS,
} from '../src/utils/duration.js';

describe('parseDuration', () => {
  describe('valid durations', () => {
    it('parses 15m', () => {
      const result = parseDuration('15m');
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.ms).toBe(15 * MINUTE_MS);
    });

    it('parses 30m', () => {
      const result = parseDuration('30m');
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.ms).toBe(30 * MINUTE_MS);
    });

    it('parses 1h', () => {
      const result = parseDuration('1h');
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.ms).toBe(1 * HOUR_MS);
    });

    it('parses 2h', () => {
      const result = parseDuration('2h');
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.ms).toBe(2 * HOUR_MS);
    });

    it('parses 4h', () => {
      const result = parseDuration('4h');
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.ms).toBe(4 * HOUR_MS);
    });

    it('parses 8h', () => {
      const result = parseDuration('8h');
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.ms).toBe(8 * HOUR_MS);
    });

    it('parses 90m', () => {
      const result = parseDuration('90m');
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.ms).toBe(90 * MINUTE_MS);
    });

    it('parses 1h 30m', () => {
      const result = parseDuration('1h 30m');
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.ms).toBe(1 * HOUR_MS + 30 * MINUTE_MS);
    });

    it('parses 4h 15m', () => {
      const result = parseDuration('4h 15m');
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.ms).toBe(4 * HOUR_MS + 15 * MINUTE_MS);
    });

    it('parses 1h30m (no space)', () => {
      const result = parseDuration('1h30m');
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.ms).toBe(1 * HOUR_MS + 30 * MINUTE_MS);
    });

    it('parses 1d', () => {
      const result = parseDuration('1d');
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.ms).toBe(1 * DAY_MS);
    });

    it('parses 2h 15m', () => {
      const result = parseDuration('2h 15m');
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.ms).toBe(2 * HOUR_MS + 15 * MINUTE_MS);
    });

    it('parses decimal hours like 1.5h', () => {
      const result = parseDuration('1.5h');
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.ms).toBe(1.5 * HOUR_MS);
    });

    it('parses decimal minutes like 1.5m', () => {
      const result = parseDuration('1.5m');
      expect(result.ok).toBe(true);
      if (result.ok) expect(result.ms).toBe(1.5 * MINUTE_MS);
    });
  });

  describe('invalid durations', () => {
    it('rejects empty string', () => {
      const result = parseDuration('');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toContain('Enter a duration');
    });

    it('rejects negative values', () => {
      const result = parseDuration('-5m');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toContain('negative');
    });

    it('rejects zero', () => {
      const result = parseDuration('0');
      expect(result.ok).toBe(false);
    });

    it('rejects 0m', () => {
      const result = parseDuration('0m');
      expect(result.ok).toBe(false);
    });

    it('rejects invalid units', () => {
      const result = parseDuration('5x');
      expect(result.ok).toBe(false);
    });

    it('rejects malformed input like 1h2', () => {
      const result = parseDuration('1h2');
      expect(result.ok).toBe(false);
    });

    it('rejects just unit letter', () => {
      const result = parseDuration('m');
      expect(result.ok).toBe(false);
    });

    it('rejects absurdly large durations', () => {
      const result = parseDuration('8d');
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.error).toContain('7 days');
    });

    it('rejects negative hours', () => {
      const result = parseDuration('-1h');
      expect(result.ok).toBe(false);
    });

    it('rejects "2 hours" (spelled out)', () => {
      const result = parseDuration('2 hours');
      expect(result.ok).toBe(false);
    });
  });
});

describe('validateDuration', () => {
  it('accepts valid duration at minimum boundary', () => {
    const result = validateDuration(MIN_DURATION_MS);
    expect(result.ok).toBe(true);
  });

  it('rejects below minimum', () => {
    const result = validateDuration(MIN_DURATION_MS - 1);
    expect(result.ok).toBe(false);
  });

  it('accepts valid duration at maximum boundary', () => {
    const result = validateDuration(MAX_DURATION_MS);
    expect(result.ok).toBe(true);
  });

  it('rejects above maximum', () => {
    const result = validateDuration(MAX_DURATION_MS + 1);
    expect(result.ok).toBe(false);
  });

  it('rejects negative', () => {
    const result = validateDuration(-1);
    expect(result.ok).toBe(false);
  });

  it('rejects zero', () => {
    const result = validateDuration(0);
    expect(result.ok).toBe(false);
  });

  it('rejects NaN', () => {
    const result = validateDuration(NaN);
    expect(result.ok).toBe(false);
  });

  it('rejects Infinity', () => {
    const result = validateDuration(Infinity);
    expect(result.ok).toBe(false);
  });
});

describe('formatCompact', () => {
  it('formats minutes', () => {
    expect(formatCompact(30 * MINUTE_MS)).toBe('30m');
  });

  it('formats hours', () => {
    expect(formatCompact(2 * HOUR_MS)).toBe('2h');
  });

  it('formats hours and minutes', () => {
    expect(formatCompact(1 * HOUR_MS + 30 * MINUTE_MS)).toBe('1h 30m');
  });

  it('formats days', () => {
    expect(formatCompact(1 * DAY_MS)).toBe('1d');
  });

  it('formats days and hours', () => {
    expect(formatCompact(1 * DAY_MS + 2 * HOUR_MS)).toBe('1d 2h');
  });
});

describe('formatSpelled', () => {
  it('formats minutes', () => {
    expect(formatSpelled(30 * MINUTE_MS)).toBe('30 minutes');
  });

  it('formats singular minute', () => {
    expect(formatSpelled(1 * MINUTE_MS)).toBe('1 minute');
  });

  it('formats hours', () => {
    expect(formatSpelled(2 * HOUR_MS)).toBe('2 hours');
  });

  it('formats singular hour', () => {
    expect(formatSpelled(1 * HOUR_MS)).toBe('1 hour');
  });

  it('formats hours and minutes', () => {
    expect(formatSpelled(1 * HOUR_MS + 30 * MINUTE_MS)).toBe('1 hour 30 minutes');
  });

  it('formats days', () => {
    expect(formatSpelled(1 * DAY_MS)).toBe('1 day');
  });

  it('formats singular day', () => {
    expect(formatSpelled(1 * DAY_MS)).toBe('1 day');
  });

  it('formats days and hours', () => {
    expect(formatSpelled(1 * DAY_MS + 2 * HOUR_MS)).toBe('1 day 2 hours');
  });

  it('handles zero', () => {
    expect(formatSpelled(0)).toBe('0 seconds');
  });
});
