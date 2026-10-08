import { jsxs as _jsxs, jsx as _jsx } from 'react/jsx-runtime';
import { Box, Text } from 'ink';
import { APP_DISPLAY_NAME } from '../constants.js';
import { theme } from '../app/theme.js';
import { Panel } from './Panel.js';
/**
 * Free-form duration input: `1h 30m`, `90m`, `2h`, `4h 15m`.
 * Parsing and validation live in `utils/duration.ts`.
 */
export function CustomDuration({ width, border, value, error, preview }) {
  const showPlaceholder = value.length === 0;
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
        _jsx(Text, { color: theme.color.cream, children: 'How long should your Mac stay awake?' }),
        _jsx(Box, { height: 1 }),
        _jsxs(Box, {
          children: [
            _jsx(Text, { color: theme.color.coffee, children: '\u276F ' }),
            showPlaceholder ? _jsx(Text, { color: theme.color.faint, children: '1h 30m' }) : null,
            _jsx(Text, { color: theme.color.cream, children: value }),
            _jsx(Text, { inverse: true, color: theme.color.cream, children: ' ' }),
          ],
        }),
        _jsx(Box, { height: 1 }),
        error
          ? _jsxs(Text, { color: theme.color.danger, children: ['\u2716 ', error] })
          : preview
            ? _jsxs(Text, { color: theme.color.awake, children: ['\u2713 That is ', preview, '.'] })
            : _jsx(Text, {
                color: theme.color.faint,
                children: 'Try 15m \u00B7 90m \u00B7 1h30m \u00B7 2h 15m',
              }),
      ],
    }),
  });
}
//# sourceMappingURL=CustomDuration.js.map
