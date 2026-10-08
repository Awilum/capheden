import { Box, Text } from 'ink';

import { APP_DISPLAY_NAME } from '../constants.js';
import { theme } from '../app/theme.js';
import { CONFIRMATION_CHOICES } from '../app/presets.js';
import type { SessionSelection } from '../app/types.js';
import { formatSpelled } from '../utils/duration.js';
import { OptionList } from './Header.js';
import { Panel } from './Panel.js';

export interface ConfirmationScreenProps {
  readonly width: number;
  readonly innerWidth: number;
  readonly border: boolean;
  readonly selection: SessionSelection;
  readonly selectedIndex: number;
}

/** Human wording for the chosen duration. */
export function describeSelection(selection: SessionSelection): string {
  return selection.mode === 'indefinite' ? 'Until I stop it' : formatSpelled(selection.durationMs);
}

/** Step 2 of the wizard: confirm before we brew. */
export function ConfirmationScreen({
  width,
  border,
  selection,
  selectedIndex,
}: ConfirmationScreenProps) {
  const label = describeSelection(selection);

  return (
    <Panel width={width} border={border}>
      <Box flexDirection="column">
        <Box justifyContent="space-between">
          <Text color={theme.color.caramel} bold>
            ☕ {APP_DISPLAY_NAME}
          </Text>
          <Text color={theme.color.faint}>step 2/2</Text>
        </Box>

        <Box height={1} />
        <Box flexDirection="column" alignItems="center">
          <Text color={theme.color.cream} bold>
            Ready to keep your Mac awake
          </Text>
          <Box height={1} />
          <Text color={theme.color.muted}>Duration</Text>
          <Text color={theme.color.caramel} bold>
            {label}
          </Text>
          {selection.mode === 'indefinite' ? (
            <Text color={theme.color.faint}>No timer — you stop it with s</Text>
          ) : null}
        </Box>

        <Box height={1} />
        <OptionList items={CONFIRMATION_CHOICES} selectedIndex={selectedIndex} />
      </Box>
    </Panel>
  );
}
