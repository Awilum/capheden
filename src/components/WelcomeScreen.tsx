import { Box, Text, useAnimation } from 'ink';

import { APP_DISPLAY_NAME, APP_TAGLINE } from '../constants.js';
import { theme } from '../app/theme.js';
import { Panel } from './Panel.js';
import { Steam } from './Steam.js';

export interface WelcomeScreenProps {
  readonly width: number;
  readonly border: boolean;
}

/** The first thing you see. Moves on by itself, or immediately on any key. */
export function WelcomeScreen({ width, border }: WelcomeScreenProps) {
  const { frame } = useAnimation({ interval: 200 });

  return (
    <Panel width={width} border={border}>
      <Box flexDirection="column" alignItems="center">
        <Steam frame={frame} width={Math.min(11, Math.max(5, width - 8))} />

        <Box height={1} />
        <Text color={theme.color.caramel}>☕</Text>

        <Box height={1} />
        <Text bold color={theme.color.cream}>
          {APP_DISPLAY_NAME}
        </Text>
        <Text color={theme.color.muted}>{APP_TAGLINE}</Text>

        <Box height={1} />
        <Text color={theme.color.faint}>Keep your Mac awake when you need it.</Text>
        <Text color={theme.color.faint}>Return to normal sleep whenever you want.</Text>
      </Box>
    </Panel>
  );
}
