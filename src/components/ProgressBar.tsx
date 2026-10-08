import { Text } from 'ink';

import { progressColor, theme } from '../app/theme.js';
import { marqueeRange } from '../utils/animation.js';

export interface ProgressBarProps {
  /** 0 → 1, or `null` for an indefinite session. */
  readonly progress: number | null;
  readonly width: number;
  /** Animation frame, only used by the indeterminate bar. */
  readonly frame?: number;
}

const FILLED = '█';
const EMPTY = '░';

/**
 * Block progress bar. Timed sessions fill up left to right and shift from green
 * to amber to red; indefinite sessions get a gentle travelling highlight.
 */
export function ProgressBar({ progress, width, frame = 0 }: ProgressBarProps) {
  const safeWidth = Math.max(4, Math.round(width));

  if (progress === null) {
    const { start, size } = marqueeRange(safeWidth, frame);
    const tail = Math.max(0, safeWidth - start - size);

    return (
      <Text>
        <Text color={theme.color.faint}>{EMPTY.repeat(start)}</Text>
        <Text color={theme.color.awake}>{FILLED.repeat(size)}</Text>
        <Text color={theme.color.faint}>{EMPTY.repeat(tail)}</Text>
      </Text>
    );
  }

  const ratio = Math.min(1, Math.max(0, progress));
  const filled = Math.round(ratio * safeWidth);

  return (
    <Text>
      <Text color={progressColor(ratio)}>{FILLED.repeat(filled)}</Text>
      <Text color={theme.color.faint}>{EMPTY.repeat(Math.max(0, safeWidth - filled))}</Text>
    </Text>
  );
}
