import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from 'react/jsx-runtime';
import { Box, Text } from 'ink';
import { APP_DISPLAY_NAME } from '../constants.js';
import { theme } from '../app/theme.js';
import { Panel } from './Panel.js';
/** Every user facing failure is rendered here, never as a stack trace. */
export function ErrorScreen({ width, border, title, message, hint, retryable }) {
  return _jsx(Panel, {
    width: width,
    border: border,
    tone: 'danger',
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
            _jsx(Text, { color: theme.color.danger, children: 'problem' }),
          ],
        }),
        _jsx(Box, { height: 1 }),
        _jsxs(Box, {
          flexDirection: 'column',
          children: [
            _jsxs(Text, { color: theme.color.danger, bold: true, children: ['\u2716 ', title] }),
            _jsx(Box, { height: 1 }),
            _jsx(Text, { color: theme.color.cream, children: message }),
            hint
              ? _jsxs(_Fragment, {
                  children: [
                    _jsx(Box, { height: 1 }),
                    _jsx(Text, { color: theme.color.muted, children: hint }),
                  ],
                })
              : null,
          ],
        }),
        _jsx(Box, { height: 1 }),
        _jsx(Text, {
          color: theme.color.faint,
          children: retryable ? 'enter try again · q quit' : 'press enter or q to quit',
        }),
      ],
    }),
  });
}
//# sourceMappingURL=ErrorScreen.js.map
