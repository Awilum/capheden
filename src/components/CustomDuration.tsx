import { Box, Text } from 'ink';

import { APP_DISPLAY_NAME } from '../constants.js';
import { theme } from '../app/theme.js';
import { Panel } from './Panel.js';

export interface CustomDurationProps {
  readonly width: number;
  readonly border: boolean;
  readonly value: string;
  readonly error: string | null;
  /** Live preview of the parsed duration, when it is valid. */
  readonly preview: string | null;
}

/**
 * Free-form duration input: `1h 30m`, `90m`, `2h`, `4h 15m`.
 * Parsing and validation live in `utils/duration.ts`.
 */
export function CustomDuration({ width, border, value, error, preview }: CustomDurationProps) {
  const showPlaceholder = value.length === 0;

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
        <Text color={theme.color.cream}>How long should your Mac stay awake?</Text>
        <Box height={1} />

        <Box>
          <Text color={theme.color.coffee}>❯ </Text>
          {showPlaceholder ? <Text color={theme.color.faint}>1h 30m</Text> : null}
          <Text color={theme.color.cream}>{value}</Text>
          <Text inverse color={theme.color.cream}>
            {' '}
          </Text>
        </Box>

        <Box height={1} />

        {error ? (
          <Text color={theme.color.danger}>✖ {error}</Text>
        ) : preview ? (
          <Text color={theme.color.awake}>✓ That is {preview}.</Text>
        ) : (
          <Text color={theme.color.faint}>Try 15m · 90m · 1h30m · 2h 15m</Text>
        )}
      </Box>
    </Panel>
  );
}
