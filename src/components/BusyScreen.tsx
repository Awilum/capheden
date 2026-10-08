import { Box, Text, useAnimation } from 'ink';

import { theme } from '../app/theme.js';
import { spinnerFrame } from '../utils/animation.js';
import { Panel } from './Panel.js';
import { Steam } from './Steam.js';

export interface BusyScreenProps {
  readonly width: number;
  readonly border: boolean;
  readonly title: string;
  readonly detail?: string;
}

/** Shown while caffeinate is being started or stopped. */
export function BusyScreen({ width, border, title, detail }: BusyScreenProps) {
  const { frame } = useAnimation({ interval: 180 });

  return (
    <Panel width={width} border={border}>
      <Box flexDirection="column" alignItems="center">
        <Steam frame={frame} width={Math.min(11, Math.max(5, width - 8))} />
        <Box height={1} />
        <Text color={theme.color.cream} bold>
          {spinnerFrame(frame)} {title}
        </Text>
        {detail ? (
          <>
            <Box height={1} />
            <Text color={theme.color.faint}>{detail}</Text>
          </>
        ) : null}
      </Box>
    </Panel>
  );
}
