import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from 'react/jsx-runtime';
import { Box, Text, useAnimation } from 'ink';
import { theme } from '../app/theme.js';
import { formatSpelled } from '../utils/duration.js';
import {
  computeCountdown,
  formatClockDuration,
  formatClockTime,
  formatElapsed,
} from '../utils/time.js';
import { describeAssertions } from '../utils/platform.js';
import { Header, StatRow } from './Header.js';
import { Panel } from './Panel.js';
import { ProgressBar } from './ProgressBar.js';
/** The live view of a running session. Redraws once per second. */
export function ActiveDashboard({
  width,
  innerWidth,
  border,
  session,
  pid,
  preventDisplaySleep,
  now,
}) {
  const { frame } = useAnimation({ interval: 1_000 });
  const countdown = computeCountdown({ startedAt: session.startedAt, endsAt: session.endsAt, now });
  const isIndefinite = session.mode === 'indefinite';
  const remainingMs = isIndefinite ? Number.POSITIVE_INFINITY : countdown.remainingMs;
  const percent = isIndefinite ? null : Math.round(countdown.progress * 100);
  const pulse = frame % 2 === 0 ? '●' : '○';
  return _jsx(Panel, {
    width: width,
    border: border,
    tone: 'active',
    children: _jsxs(Box, {
      flexDirection: 'column',
      children: [
        _jsx(Header, { detail: isIndefinite ? 'until stopped' : 'session active' }),
        _jsx(Box, { height: 1 }),
        _jsxs(Box, {
          flexDirection: 'column',
          alignItems: 'center',
          children: [
            _jsxs(Text, { color: theme.color.awake, bold: true, children: [pulse, ' AWAKE'] }),
            _jsx(Box, { height: 1 }),
            _jsx(Text, {
              color: theme.color.cream,
              bold: true,
              children: formatClockDuration(remainingMs),
            }),
            _jsx(Text, {
              color: theme.color.muted,
              children: isIndefinite ? 'until stopped' : 'remaining',
            }),
            _jsx(Box, { height: 1 }),
            _jsx(ProgressBar, {
              progress: isIndefinite ? null : countdown.progress,
              width: innerWidth,
              frame: frame,
            }),
            _jsx(Box, { height: 1 }),
            _jsx(Text, {
              color: theme.color.faint,
              children: isIndefinite
                ? 'running with no timer · press s to stop'
                : `${percent}% of the session elapsed`,
            }),
          ],
        }),
        _jsx(Box, { height: 1 }),
        isIndefinite
          ? _jsx(StatRow, {
              label: 'Mode',
              value: 'Until stopped',
              valueColor: theme.color.awake,
              width: innerWidth,
            })
          : _jsxs(_Fragment, {
              children: [
                _jsx(StatRow, {
                  label: 'Duration',
                  value: formatSpelled(session.durationMs ?? 0),
                  width: innerWidth,
                }),
                _jsx(StatRow, {
                  label: 'Started',
                  value: formatClockTime(session.startedAt ?? now),
                  width: innerWidth,
                }),
                _jsx(StatRow, {
                  label: 'Ends',
                  value: formatClockTime(session.endsAt ?? now),
                  width: innerWidth,
                }),
                _jsx(StatRow, {
                  label: 'Elapsed',
                  value: formatElapsed(countdown.elapsedMs),
                  width: innerWidth,
                }),
              ],
            }),
        _jsx(Box, { height: 1 }),
        _jsx(StatRow, {
          label: 'caffeinate',
          value: `pid ${pid ?? '—'} · ${describeAssertions(preventDisplaySleep)}`,
          valueColor: theme.color.muted,
          width: innerWidth,
        }),
      ],
    }),
  });
}
//# sourceMappingURL=ActiveDashboard.js.map
