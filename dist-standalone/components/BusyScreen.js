import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from 'react/jsx-runtime';
import { Box, Text, useAnimation } from 'ink';
import { theme } from '../app/theme.js';
import { spinnerFrame } from '../utils/animation.js';
import { Panel } from './Panel.js';
import { Steam } from './Steam.js';
/** Shown while caffeinate is being started or stopped. */
export function BusyScreen({ width, border, title, detail }) {
  const { frame } = useAnimation({ interval: 180 });
  return _jsx(Panel, {
    width: width,
    border: border,
    children: _jsxs(Box, {
      flexDirection: 'column',
      alignItems: 'center',
      children: [
        _jsx(Steam, { frame: frame, width: Math.min(11, Math.max(5, width - 8)) }),
        _jsx(Box, { height: 1 }),
        _jsxs(Text, {
          color: theme.color.cream,
          bold: true,
          children: [spinnerFrame(frame), ' ', title],
        }),
        detail
          ? _jsxs(_Fragment, {
              children: [
                _jsx(Box, { height: 1 }),
                _jsx(Text, { color: theme.color.faint, children: detail }),
              ],
            })
          : null,
      ],
    }),
  });
}
//# sourceMappingURL=BusyScreen.js.map
