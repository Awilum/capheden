import { Box, Text, useAnimation } from 'ink';

import { theme } from '../app/theme.js';
import type { SessionSnapshot } from '../app/types.js';
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

export interface ActiveDashboardProps {
  readonly width: number;
  readonly innerWidth: number;
  readonly border: boolean;
  readonly session: SessionSnapshot;
  readonly pid: number | undefined;
  readonly preventDisplaySleep: boolean;
  readonly now: number;
}

/** The live view of a running session. Redraws once per second. */
export function ActiveDashboard({
  width,
  innerWidth,
  border,
  session,
  pid,
  preventDisplaySleep,
  now,
}: ActiveDashboardProps) {
  const { frame } = useAnimation({ interval: 1_000 });
  const countdown = computeCountdown({ startedAt: session.startedAt, endsAt: session.endsAt, now });
  const isIndefinite = session.mode === 'indefinite';
  const remainingMs = isIndefinite ? Number.POSITIVE_INFINITY : countdown.remainingMs;
  const percent = isIndefinite ? null : Math.round(countdown.progress * 100);
  const pulse = frame % 2 === 0 ? '●' : '○';

  return (
    <Panel width={width} border={border} tone="active">
      <Box flexDirection="column">
        <Header detail={isIndefinite ? 'until stopped' : 'session active'} />

        <Box height={1} />
        <Box flexDirection="column" alignItems="center">
          <Text color={theme.color.awake} bold>
            {pulse} AWAKE
          </Text>
          <Box height={1} />
          <Text color={theme.color.cream} bold>
            {formatClockDuration(remainingMs)}
          </Text>
          <Text color={theme.color.muted}>{isIndefinite ? 'until stopped' : 'remaining'}</Text>
          <Box height={1} />
          <ProgressBar
            progress={isIndefinite ? null : countdown.progress}
            width={innerWidth}
            frame={frame}
          />
          <Box height={1} />
          <Text color={theme.color.faint}>
            {isIndefinite
              ? 'running with no timer · press s to stop'
              : `${percent}% of the session elapsed`}
          </Text>
        </Box>

        <Box height={1} />

        {isIndefinite ? (
          <StatRow
            label="Mode"
            value="Until stopped"
            valueColor={theme.color.awake}
            width={innerWidth}
          />
        ) : (
          <>
            <StatRow
              label="Duration"
              value={formatSpelled(session.durationMs ?? 0)}
              width={innerWidth}
            />
            <StatRow
              label="Started"
              value={formatClockTime(session.startedAt ?? now)}
              width={innerWidth}
            />
            <StatRow
              label="Ends"
              value={formatClockTime(session.endsAt ?? now)}
              width={innerWidth}
            />
            <StatRow
              label="Elapsed"
              value={formatElapsed(countdown.elapsedMs)}
              width={innerWidth}
            />
          </>
        )}

        <Box height={1} />
        <StatRow
          label="caffeinate"
          value={`pid ${pid ?? '—'} · ${describeAssertions(preventDisplaySleep)}`}
          valueColor={theme.color.muted}
          width={innerWidth}
        />
      </Box>
    </Panel>
  );
}
