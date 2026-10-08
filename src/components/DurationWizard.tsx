import { Box, Text } from 'ink';

import { APP_DISPLAY_NAME } from '../constants.js';
import { theme } from '../app/theme.js';
import type { DurationChoice } from '../app/types.js';
import { DurationList } from './DurationList.js';
import { Panel } from './Panel.js';

export interface DurationWizardProps {
  readonly width: number;
  readonly border: boolean;
  readonly choices: readonly DurationChoice[];
  readonly selectedIndex: number;
  readonly step: number;
  readonly totalSteps: number;
}

/** Step 1 of the wizard: how long should the Mac stay awake? */
export function DurationWizard({
  width,
  border,
  choices,
  selectedIndex,
  step,
  totalSteps,
}: DurationWizardProps) {
  return (
    <Panel width={width} border={border}>
      <Box flexDirection="column">
        <Box justifyContent="space-between">
          <Text color={theme.color.caramel} bold>
            ☕ {APP_DISPLAY_NAME}
          </Text>
          <Text color={theme.color.faint}>
            step {step}/{totalSteps}
          </Text>
        </Box>

        <Box height={1} />
        <Text color={theme.color.cream}>How long should your Mac stay awake?</Text>
        <Box height={1} />

        <DurationList choices={choices} selectedIndex={selectedIndex} />
      </Box>
    </Panel>
  );
}
