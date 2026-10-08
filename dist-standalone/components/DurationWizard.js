import { jsxs as _jsxs, jsx as _jsx } from 'react/jsx-runtime';
import { Box, Text } from 'ink';
import { APP_DISPLAY_NAME } from '../constants.js';
import { theme } from '../app/theme.js';
import { DurationList } from './DurationList.js';
import { Panel } from './Panel.js';
/** Step 1 of the wizard: how long should the Mac stay awake? */
export function DurationWizard({ width, border, choices, selectedIndex, step, totalSteps }) {
  return _jsx(Panel, {
    width: width,
    border: border,
    children: _jsxs(Box, {
      flexDirection: 'column',
      children: [
        _jsxs(Box, {
          justifyContent: 'space-between',
          children: [
            _jsxs(Text, {
              color: theme.color.caramel,
              bold: true,
              children: ['\u2615 ', APP_DISPLAY_NAME],
            }),
            _jsxs(Text, { color: theme.color.faint, children: ['step ', step, '/', totalSteps] }),
          ],
        }),
        _jsx(Box, { height: 1 }),
        _jsx(Text, { color: theme.color.cream, children: 'How long should your Mac stay awake?' }),
        _jsx(Box, { height: 1 }),
        _jsx(DurationList, { choices: choices, selectedIndex: selectedIndex }),
      ],
    }),
  });
}
//# sourceMappingURL=DurationWizard.js.map
