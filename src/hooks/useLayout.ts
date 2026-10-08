import { useWindowSize } from 'ink';

export interface Layout {
  /** Outer width of the panel, borders included. */
  readonly width: number;
  /** Space available for content inside the panel. */
  readonly innerWidth: number;
  /** Very narrow terminals: drop the frame and live with plain text. */
  readonly compact: boolean;
  readonly border: boolean;
}

export const MAX_PANEL_WIDTH = 60;
export const MIN_PANEL_WIDTH = 22;

/**
 * Width decisions live here so every screen adapts the same way.
 *
 * `compact` kicks in below 38 columns, which covers VS Code side panels and
 * split tmux panes.
 */
export function useLayout(maxWidth: number = MAX_PANEL_WIDTH): Layout {
  const { columns } = useWindowSize();

  const available = Math.max(MIN_PANEL_WIDTH, columns);
  const width = Math.min(available, maxWidth);
  const compact = width < 38;

  const chrome = compact ? 0 : 2 + 4; // borders + horizontal padding
  const innerWidth = Math.max(8, width - chrome);

  return { width, innerWidth, compact, border: !compact };
}
