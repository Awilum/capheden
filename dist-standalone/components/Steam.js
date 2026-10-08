import { jsx as _jsx } from 'react/jsx-runtime';
import { Box, Text } from 'ink';
import { theme } from '../app/theme.js';
import { steamFrames } from '../utils/animation.js';
/** Animated steam rising out of the cup. */
export function Steam({ frame, width = 11, color = theme.color.border }) {
  const lines = steamFrames(frame, width);
  return _jsx(Box, {
    flexDirection: 'column',
    alignItems: 'center',
    children: lines.map((line, index) =>
      _jsx(Text, { color: color, children: line }, `${index}-${line}`),
    ),
  });
}
/** Horizontal rule that also works inside boxes without borders. */
export function Divider({ width, color = theme.color.border }) {
  return _jsx(Text, { color: color, children: '─'.repeat(Math.max(0, width)) });
}
//# sourceMappingURL=Steam.js.map
