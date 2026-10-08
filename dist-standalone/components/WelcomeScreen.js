import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { Box, Text, useAnimation } from 'ink';
import { APP_DISPLAY_NAME, APP_TAGLINE } from '../constants.js';
import { theme } from '../app/theme.js';
import { Panel } from './Panel.js';
import { Steam } from './Steam.js';
/** The first thing you see. Moves on by itself, or immediately on any key. */
export function WelcomeScreen({ width, border }) {
  const { frame } = useAnimation({ interval: 200 });
  return _jsx(Panel, {
    width: width,
    border: border,
    children: _jsxs(Box, {
      flexDirection: 'column',
      alignItems: 'center',
      children: [
        _jsx(Steam, { frame: frame, width: Math.min(11, Math.max(5, width - 8)) }),
        _jsx(Box, { height: 1 }),
        _jsx(Text, { color: theme.color.caramel, children: '\u2615' }),
        _jsx(Box, { height: 1 }),
        _jsx(Text, { bold: true, color: theme.color.cream, children: APP_DISPLAY_NAME }),
        _jsx(Text, { color: theme.color.muted, children: APP_TAGLINE }),
        _jsx(Box, { height: 1 }),
        _jsx(Text, { color: theme.color.faint, children: 'Keep your Mac awake when you need it.' }),
        _jsx(Text, {
          color: theme.color.faint,
          children: 'Return to normal sleep whenever you want.',
        }),
      ],
    }),
  });
}
//# sourceMappingURL=WelcomeScreen.js.map
