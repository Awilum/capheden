import { jsx as _jsx } from 'react/jsx-runtime';
import { Box } from 'ink';
import { theme } from '../app/theme.js';
const TONE_COLORS = {
  default: theme.color.border,
  active: theme.color.awake,
  warn: theme.color.warn,
  danger: theme.color.danger,
};
/**
 * The rounded frame every screen sits in. Renders as plain content when there
 * is not enough room for a border, so narrow terminals degrade gracefully.
 */
export function Panel({ width, border = true, tone = 'default', children }) {
  return _jsx(Box, {
    flexDirection: 'column',
    width: width,
    borderStyle: border ? 'round' : undefined,
    borderColor: TONE_COLORS[tone],
    paddingX: border ? 2 : 0,
    children: children,
  });
}
//# sourceMappingURL=Panel.js.map
