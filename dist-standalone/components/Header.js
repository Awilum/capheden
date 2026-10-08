import { jsxs as _jsxs, jsx as _jsx } from 'react/jsx-runtime';
import { Box, Text } from 'ink';
import { APP_DISPLAY_NAME } from '../constants.js';
import { theme } from '../app/theme.js';
export function Header({ detail }) {
  return _jsxs(Box, {
    justifyContent: 'space-between',
    children: [
      _jsxs(Text, {
        color: theme.color.caramel,
        bold: true,
        children: ['\u2615 ', APP_DISPLAY_NAME],
      }),
      detail ? _jsx(Text, { color: theme.color.faint, children: detail }) : null,
    ],
  });
}
/** Keyboard driven list with the `❯` cursor used across the wizard. */
export function OptionList({ items, selectedIndex, dimmed = false }) {
  return _jsx(Box, {
    flexDirection: 'column',
    children: items.map((item, index) => {
      const selected = index === selectedIndex;
      return _jsx(
        Box,
        {
          flexDirection: 'column',
          children: _jsxs(Box, {
            children: [
              _jsx(Text, {
                color: selected ? theme.color.coffee : theme.color.faint,
                children: selected ? '❯ ' : '  ',
              }),
              _jsx(Text, {
                bold: selected,
                underline: selected,
                color: selected ? theme.color.cream : theme.color.muted,
                dimColor: dimmed && !selected,
                children: item.label,
              }),
              item.hint
                ? _jsxs(Text, { color: theme.color.faint, children: [' ', item.hint] })
                : null,
            ],
          }),
        },
        item.id,
      );
    }),
  });
}
/** A `label ................ value` row for the dashboard. */
export function StatRow({ label, value, valueColor = theme.color.cream, width }) {
  return _jsxs(Box, {
    justifyContent: 'space-between',
    width: width,
    children: [
      _jsx(Text, { color: theme.color.muted, children: label }),
      _jsx(Text, { color: valueColor, children: value }),
    ],
  });
}
//# sourceMappingURL=Header.js.map
