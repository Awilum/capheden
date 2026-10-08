import { useWindowSize } from 'ink';
export const MAX_PANEL_WIDTH = 60;
export const MIN_PANEL_WIDTH = 22;
/**
 * Width decisions live here so every screen adapts the same way.
 *
 * `compact` kicks in below 38 columns, which covers VS Code side panels and
 * split tmux panes.
 */
export function useLayout(maxWidth = MAX_PANEL_WIDTH) {
  const { columns } = useWindowSize();
  const available = Math.max(MIN_PANEL_WIDTH, columns);
  const width = Math.min(available, maxWidth);
  const compact = width < 38;
  const chrome = compact ? 0 : 2 + 4; // borders + horizontal padding
  const innerWidth = Math.max(8, width - chrome);
  return { width, innerWidth, compact, border: !compact };
}
//# sourceMappingURL=useLayout.js.map
