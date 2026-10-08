import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from 'react/jsx-runtime';
import { Box, Text } from 'ink';
import { APP_DISPLAY_NAME } from '../constants.js';
import { theme } from '../app/theme.js';
import { COMPLETED_CHOICES } from '../app/presets.js';
import { formatSpelled } from '../utils/duration.js';
import { OptionList } from './Header.js';
import { Panel } from './Panel.js';
const COPY = {
  stopped: {
    title: '✓ Session stopped',
    body: 'Your Mac can sleep normally again.',
    color: theme.color.warn,
  },
  expired: {
    title: '☕ Session complete',
    body: 'Your session ended. Your Mac can sleep normally again.',
    color: theme.color.awake,
  },
  unexpected: {
    title: '⚠ caffeinate stopped unexpectedly',
    body: 'The sleep assertion is gone. Your Mac can sleep normally again.',
    color: theme.color.danger,
  },
};
/** Shown after stopping a session by hand, or when the timer runs out. */
export function CompletionScreen({ width, border, reason, session, selectedIndex }) {
  const copy = COPY[reason];
  const awakeFor = session.elapsedMs > 0 ? formatSpelled(session.elapsedMs) : null;
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
            _jsx(Text, { color: theme.color.faint, children: reason }),
          ],
        }),
        _jsx(Box, { height: 1 }),
        _jsxs(Box, {
          flexDirection: 'column',
          alignItems: 'center',
          children: [
            _jsx(Text, { color: copy.color, bold: true, children: copy.title }),
            _jsx(Box, { height: 1 }),
            _jsx(Text, { color: theme.color.cream, children: copy.body }),
            awakeFor
              ? _jsxs(_Fragment, {
                  children: [
                    _jsx(Box, { height: 1 }),
                    _jsxs(Text, {
                      color: theme.color.faint,
                      children: ['Your Mac stayed awake for ', awakeFor, '.'],
                    }),
                  ],
                })
              : null,
          ],
        }),
        _jsx(Box, { height: 1 }),
        _jsx(OptionList, { items: COMPLETED_CHOICES, selectedIndex: selectedIndex }),
      ],
    }),
  });
}
//# sourceMappingURL=CompletionScreen.js.map
