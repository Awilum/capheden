import { Box, Text } from 'ink';

import { theme } from '../app/theme.js';
import { steamFrames } from '../utils/animation.js';

export interface SteamProps {
  readonly frame: number;
  readonly width?: number;
  readonly color?: string;
}

/** Animated steam rising out of the cup. */
export function Steam({ frame, width = 11, color = theme.color.border }: SteamProps) {
  const lines = steamFrames(frame, width);

  return (
    <Box flexDirection="column" alignItems="center">
      {lines.map((line, index) => (
        <Text key={`${index}-${line}`} color={color}>
          {line}
        </Text>
      ))}
    </Box>
  );
}

export interface DividerProps {
  readonly width: number;
  readonly color?: string;
}

/** Horizontal rule that also works inside boxes without borders. */
export function Divider({ width, color = theme.color.border }: DividerProps) {
  return <Text color={color}>{'─'.repeat(Math.max(0, width))}</Text>;
}
