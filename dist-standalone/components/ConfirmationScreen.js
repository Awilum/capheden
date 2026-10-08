import { jsxs as _jsxs, jsx as _jsx } from 'react/jsx-runtime';
import { Box, Text } from 'ink';
import { APP_DISPLAY_NAME } from '../constants.js';
import { theme } from '../app/theme.js';
import { CONFIRMATION_CHOICES } from '../app/presets.js';
import { formatSpelled } from '../utils/duration.js';
import { OptionList } from './Header.js';
import { Panel } from './Panel.js';
/** Human wording for the chosen duration. */
export function describeSelection(selection) {
  return selection.mode === 'indefinite' ? 'Until I stop it' : formatSpelled(selection.durationMs);
}
/** Step 2 of the wizard: confirm before we brew. */
export function ConfirmationScreen({ width, border, selection, selectedIndex }) {
  const label = describeSelection(selection);
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
            _jsx(Text, { color: theme.color.faint, children: 'step 2/2' }),
          ],
        }),
        _jsx(Box, { height: 1 }),
        _jsxs(Box, {
          flexDirection: 'column',
          alignItems: 'center',
          children: [
            _jsx(Text, {
              color: theme.color.cream,
              bold: true,
              children: 'Ready to keep your Mac awake',
            }),
            _jsx(Box, { height: 1 }),
            _jsx(Text, { color: theme.color.muted, children: 'Duration' }),
            _jsx(Text, { color: theme.color.caramel, bold: true, children: label }),
            selection.mode === 'indefinite'
              ? _jsx(Text, {
                  color: theme.color.faint,
                  children: 'No timer \u2014 you stop it with s',
                })
              : null,
          ],
        }),
        _jsx(Box, { height: 1 }),
        _jsx(OptionList, { items: CONFIRMATION_CHOICES, selectedIndex: selectedIndex }),
      ],
    }),
  });
}
//# sourceMappingURL=ConfirmationScreen.js.map
