import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { Text } from 'ink';
import { progressColor, theme } from '../app/theme.js';
import { marqueeRange } from '../utils/animation.js';
const FILLED = '█';
const EMPTY = '░';
/**
 * Block progress bar. Timed sessions fill up left to right and shift from green
 * to amber to red; indefinite sessions get a gentle travelling highlight.
 */
export function ProgressBar({ progress, width, frame = 0 }) {
  const safeWidth = Math.max(4, Math.round(width));
  if (progress === null) {
    const { start, size } = marqueeRange(safeWidth, frame);
    const tail = Math.max(0, safeWidth - start - size);
    return _jsxs(Text, {
      children: [
        _jsx(Text, { color: theme.color.faint, children: EMPTY.repeat(start) }),
        _jsx(Text, { color: theme.color.awake, children: FILLED.repeat(size) }),
        _jsx(Text, { color: theme.color.faint, children: EMPTY.repeat(tail) }),
      ],
    });
  }
  const ratio = Math.min(1, Math.max(0, progress));
  const filled = Math.round(ratio * safeWidth);
  return _jsxs(Text, {
    children: [
      _jsx(Text, { color: progressColor(ratio), children: FILLED.repeat(filled) }),
      _jsx(Text, {
        color: theme.color.faint,
        children: EMPTY.repeat(Math.max(0, safeWidth - filled)),
      }),
    ],
  });
}
//# sourceMappingURL=ProgressBar.js.map
