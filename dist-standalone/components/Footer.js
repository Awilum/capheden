import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { Text } from 'ink';
import { theme } from '../app/theme.js';
export function Footer({ hints, detail }) {
  const separator = _jsx(Text, { color: theme.color.faint, children: ' · ' });
  return _jsxs(Text, {
    children: [
      hints.map((hint, index) =>
        _jsxs(
          Text,
          {
            children: [
              index > 0 ? separator : null,
              _jsx(Text, { color: theme.color.coffee, children: hint.key }),
              _jsxs(Text, { color: theme.color.faint, children: [' ', hint.label] }),
            ],
          },
          hint.key,
        ),
      ),
      detail ? _jsx(Text, { color: theme.color.faint, children: `  ${detail}` }) : null,
    ],
  });
}
//# sourceMappingURL=Footer.js.map
