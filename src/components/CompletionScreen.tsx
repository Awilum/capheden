import { Box, Text } from 'ink';

import { APP_DISPLAY_NAME } from '../constants.js';
import { theme } from '../app/theme.js';
import type { CompletionReason } from '../app/state.js';
import { COMPLETED_CHOICES } from '../app/presets.js';
import type { SessionSnapshot } from '../app/types.js';
import { formatSpelled } from '../utils/duration.js';
import { OptionList } from './Header.js';
import { Panel } from './Panel.js';

export interface CompletionScreenProps {
  readonly width: number;
  readonly innerWidth: number;
  readonly border: boolean;
  readonly reason: CompletionReason;
  readonly session: SessionSnapshot;
  readonly selectedIndex: number;
}

const COPY: Record<CompletionReason, { title: string; body: string; color: string }> = {
  stopped: {
    title: '✓ Session stopped',
    body: 'Your Mac can sleep normally again.',
    color: theme.color.warn,
  },
  expired: {
    title: '☕ Session complete',
    body: 'Your session ended. Your Mac can sleep normally again.',
    color: theme.color.awake,
  },
  unexpected: {
    title: '⚠ caffeinate stopped unexpectedly',
    body: 'The sleep assertion is gone. Your Mac can sleep normally again.',
    color: theme.color.danger,
  },
};

/** Shown after stopping a session by hand, or when the timer runs out. */
export function CompletionScreen({
  width,
  border,
  reason,
  session,
  selectedIndex,
}: CompletionScreenProps) {
  const copy = COPY[reason];
  const awakeFor = session.elapsedMs > 0 ? formatSpelled(session.elapsedMs) : null;

  return (
    <Panel width={width} border={border}>
      <Box flexDirection="column">
        <Box justifyContent="space-between">
          <Text color={theme.color.caramel} bold>
            ☕ {APP_DISPLAY_NAME}
          </Text>
          <Text color={theme.color.faint}>{reason}</Text>
        </Box>

        <Box height={1} />
        <Box flexDirection="column" alignItems="center">
          <Text color={copy.color} bold>
            {copy.title}
          </Text>
          <Box height={1} />
          <Text color={theme.color.cream}>{copy.body}</Text>
          {awakeFor ? (
            <>
              <Box height={1} />
              <Text color={theme.color.faint}>Your Mac stayed awake for {awakeFor}.</Text>
            </>
          ) : null}
        </Box>

        <Box height={1} />
        <OptionList items={COMPLETED_CHOICES} selectedIndex={selectedIndex} />
      </Box>
    </Panel>
  );
}
