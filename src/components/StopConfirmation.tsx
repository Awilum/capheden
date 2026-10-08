import { Box, Text } from 'ink';

import { theme } from '../app/theme.js';
import { STOP_CHOICES } from '../app/presets.js';
import { OptionList } from './Header.js';
import { Panel } from './Panel.js';

export interface StopConfirmationProps {
  readonly width: number;
  readonly border: boolean;
  readonly selectedIndex: number;
}

/** Confirmation shown after pressing `s` (or escape) during a session. */
export function StopConfirmation({ width, border, selectedIndex }: StopConfirmationProps) {
  return (
    <Panel width={width} border={border} tone="warn">
      <Box flexDirection="column">
        <Box justifyContent="space-between">
          <Text color={theme.color.caramel} bold>
            ☕ Cà Phê Đen
          </Text>
          <Text color={theme.color.warn}>session active</Text>
        </Box>

        <Box height={1} />
        <Text color={theme.color.cream} bold>
          Stop keeping your Mac awake?
        </Text>
        <Box height={1} />
        <OptionList items={STOP_CHOICES} selectedIndex={selectedIndex} />
      </Box>
    </Panel>
  );
}
