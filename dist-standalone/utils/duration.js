export const SECOND_MS = 1_000;
export const MINUTE_MS = 60 * SECOND_MS;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;
/** A session shorter than a minute is never useful, so refuse it with a clear message. */
export const MIN_DURATION_MS = MINUTE_MS;
/** Guard rail so a typo can never leave caffeinate running "forever". */
export const MAX_DURATION_MS = 7 * DAY_MS;
const UNIT_MS = {
  d: DAY_MS,
  h: HOUR_MS,
  m: MINUTE_MS,
  s: SECOND_MS,
};
/** One or more `<number><unit>` groups, e.g. `15m`, `1h30m`, `2h 15m`, `1.5h`, `1d`. */
const DURATION_PATTERN = /^(?:\d+(?:\.\d+)?[dhms])+$/i;
const TOKEN_PATTERN = /(\d+(?:\.\d+)?)([dhms])/gi;
/**
 * Parse a human friendly duration such as `30m`, `2h`, `90m`, `1h 30m` or `4h15m`.
 *
 * Returns a discriminated result so the UI can show a friendly error instead of
 * throwing at the user.
 */
export function parseDuration(input) {
  const raw = input.trim();
  if (raw.length === 0) {
    return { ok: false, error: 'Enter a duration first — for example 30m or 1h 30m.' };
  }
  if (raw.includes('-')) {
    return { ok: false, error: 'Durations cannot be negative.' };
  }
  const compact = raw.replaceAll(/\s+/g, '');
  if (!DURATION_PATTERN.test(compact)) {
    return {
      ok: false,
      error: `I don't understand “${raw}”. Try 15m, 90m, 1h 30m or 2h.`,
    };
  }
  let totalMs = 0;
  for (const token of compact.matchAll(TOKEN_PATTERN)) {
    const [, amount, unit] = token;
    totalMs += Number.parseFloat(amount ?? '0') * (UNIT_MS[(unit ?? 'm').toLowerCase()] ?? 0);
  }
  return validateDuration(totalMs);
}
/** Validate an already computed duration. Shared by the parser and the preset list. */
export function validateDuration(ms) {
  if (!Number.isFinite(ms) || ms <= 0) {
    return { ok: false, error: 'Duration must be greater than zero.' };
  }
  if (ms < MIN_DURATION_MS) {
    return { ok: false, error: 'Duration must be at least 1 minute.' };
  }
  if (ms > MAX_DURATION_MS) {
    return { ok: false, error: 'Duration must be 7 days or less.' };
  }
  return { ok: true, ms: Math.round(ms / SECOND_MS) * SECOND_MS };
}
/** Compact, developer-tool style format: `45m`, `2h`, `1h 30m`, `1d 2h`. */
export function formatCompact(ms) {
  const totalSeconds = Math.max(0, Math.round(ms / SECOND_MS));
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (parts.length === 0) parts.push(`${seconds}s`);
  return parts.join(' ');
}
const SPELLED_UNITS = {
  d: ['day', 'days'],
  h: ['hour', 'hours'],
  m: ['minute', 'minutes'],
  s: ['second', 'seconds'],
};
/** Prose format for confirmation screens: `2 hours`, `1 hour 30 minutes`. */
export function formatSpelled(ms) {
  const totalSeconds = Math.max(0, Math.round(ms / SECOND_MS));
  const chunks = [
    [Math.floor(totalSeconds / 86_400), 'd'],
    [Math.floor((totalSeconds % 86_400) / 3_600), 'h'],
    [Math.floor((totalSeconds % 3_600) / 60), 'm'],
    [totalSeconds % 60, 's'],
  ];
  const parts = [];
  for (const [value, unit] of chunks) {
    if (value <= 0) continue;
    const [singular, plural] = SPELLED_UNITS[unit];
    parts.push(`${value} ${value === 1 ? singular : plural}`);
  }
  return parts.length > 0 ? parts.join(' ') : '0 seconds';
}
//# sourceMappingURL=duration.js.map
