import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { Box, Text } from 'ink';
import { theme } from '../app/theme.js';
import { STOP_CHOICES } from '../app/presets.js';
import { OptionList } from './Header.js';
import { Panel } from './Panel.js';
/** Confirmation shown after pressing `s` (or escape) during a session. */
export function StopConfirmation({ width, border, selectedIndex }) {
  return _jsx(Panel, {
    width: width,
    border: border,
    tone: 'warn',
    children: _jsxs(Box, {
      flexDirection: 'column',
      children: [
        _jsxs(Box, {
          justifyContent: 'space-between',
          children: [
            _jsx(Text, {
              color: theme.color.caramel,
              bold: true,
              children: '\u2615 C\u00E0 Ph\u00EA \u0110en',
            }),
            _jsx(Text, { color: theme.color.warn, children: 'session active' }),
          ],
        }),
        _jsx(Box, { height: 1 }),
        _jsx(Text, {
          color: theme.color.cream,
          bold: true,
          children: 'Stop keeping your Mac awake?',
        }),
        _jsx(Box, { height: 1 }),
        _jsx(OptionList, { items: STOP_CHOICES, selectedIndex: selectedIndex }),
      ],
    }),
  });
}
//# sourceMappingURL=StopConfirmation.js.map
