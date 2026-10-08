import type React from 'react';
import { Box } from 'ink';

import { theme } from '../app/theme.js';

export type PanelTone = 'default' | 'active' | 'warn' | 'danger';

export interface PanelProps {
  readonly width: number;
  /** Drop the rounded frame on very narrow terminals. */
  readonly border?: boolean;
  readonly tone?: PanelTone;
  readonly children: React.ReactNode;
}

const TONE_COLORS: Record<PanelTone, string> = {
  default: theme.color.border,
  active: theme.color.awake,
  warn: theme.color.warn,
  danger: theme.color.danger,
};

/**
 * The rounded frame every screen sits in. Renders as plain content when there
 * is not enough room for a border, so narrow terminals degrade gracefully.
 */
export function Panel({ width, border = true, tone = 'default', children }: PanelProps) {
  return (
    <Box
      flexDirection="column"
      width={width}
      borderStyle={border ? 'round' : undefined}
      borderColor={TONE_COLORS[tone]}
      paddingX={border ? 2 : 0}
    >
      {children}
    </Box>
  );
}
