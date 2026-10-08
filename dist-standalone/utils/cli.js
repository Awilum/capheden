import { parseDuration } from './duration.js';
const HELP_FLAGS = new Set(['-h', '--help']);
const VERSION_FLAGS = new Set(['-v', '-V', '--version']);
const INDEFINITE_FLAGS = new Set(['-u', '--until-stopped', '--until', '--indefinite']);
const DISPLAY_FLAGS = new Set(['-d', '--display']);
/**
 * Parse `process.argv.slice(2)`.
 *
 * The wizard is the default: no arguments means "let me choose in the UI".
 */
export function parseCliArgs(argv) {
  let wantsHelp = false;
  let wantsVersion = false;
  let indefinite = false;
  let preventDisplaySleep = false;
  const positionals = [];
  let onlyPositionals = false;
  for (const arg of argv) {
    if (onlyPositionals) {
      positionals.push(arg);
      continue;
    }
    if (arg === '--') {
      onlyPositionals = true;
      continue;
    }
    if (HELP_FLAGS.has(arg)) {
      wantsHelp = true;
      continue;
    }
    if (VERSION_FLAGS.has(arg)) {
      wantsVersion = true;
      continue;
    }
    if (INDEFINITE_FLAGS.has(arg)) {
      indefinite = true;
      continue;
    }
    if (DISPLAY_FLAGS.has(arg)) {
      preventDisplaySleep = true;
      continue;
    }
    if (arg.startsWith('-') && arg.length > 1) {
      return {
        kind: 'error',
        message: `Unknown option “${arg}”. Run \`capheden --help\` to see what is available.`,
      };
    }
    positionals.push(arg);
  }
  if (wantsHelp) return { kind: 'help' };
  if (wantsVersion) return { kind: 'version' };
  const rawDuration = joinPositionalDuration(positionals);
  if (indefinite) {
    if (rawDuration !== undefined) {
      return {
        kind: 'error',
        message: 'Use either a duration or --until-stopped, not both.',
      };
    }
    return { kind: 'session', selection: { mode: 'indefinite' }, preventDisplaySleep };
  }
  if (rawDuration === undefined) {
    return { kind: 'wizard' };
  }
  const parsed = parseDuration(rawDuration);
  if (!parsed.ok) return { kind: 'error', message: parsed.error };
  return {
    kind: 'session',
    selection: { mode: 'timed', durationMs: parsed.ms },
    preventDisplaySleep,
  };
}
/**
 * `capheden 1h 30m` arrives as two arguments, so join them back into one string
 * before parsing. Returns `undefined` when no duration was given.
 */
function joinPositionalDuration(positionals) {
  if (positionals.length === 0) return undefined;
  if (positionals.length === 1) return positionals[0];
  return positionals.join(' ');
}
export function helpText(version) {
  return `Cà Phê Đen ☕  v${version}
A beautiful macOS terminal app that keeps your Mac awake.

USAGE
  capheden                    Open the interactive wizard
  capheden <duration>         Start a session straight away
  capheden --until-stopped    Stay awake until you stop it

DURATIONS
  15m   30m   90m   1h   2h   4h   8h   1h30m   2h 15m   1d

EXAMPLES
  capheden 30m
  capheden 2h
  capheden 1h 30m
  capheden --until-stopped

OPTIONS
  -u, --until-stopped   Keep your Mac awake with no timer
  -d, --display         Also prevent the display from sleeping
  -h, --help            Show this help
  -v, --version         Show the version

KEYS
  wizard    ↑/↓ navigate · enter select · esc back · q quit
  session   s stop · esc stop · q quit

Drives the native macOS caffeinate utility. No cables, no surprises.`;
}
//# sourceMappingURL=cli.js.map
