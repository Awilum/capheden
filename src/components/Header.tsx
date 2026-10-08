import { Box, Text } from 'ink';

import { APP_DISPLAY_NAME } from '../constants.js';
import { theme } from '../app/theme.js';

export interface HeaderProps {
  /** Right aligned secondary label, e.g. `2 hours` or `pid 41207`. */
  readonly detail?: string;
}

export function Header({ detail }: HeaderProps) {
  return (
    <Box justifyContent="space-between">
      <Text color={theme.color.caramel} bold>
        ☕ {APP_DISPLAY_NAME}
      </Text>
      {detail ? <Text color={theme.color.faint}>{detail}</Text> : null}
    </Box>
  );
}

export interface OptionItem {
  readonly id: string;
  readonly label: string;
  readonly hint?: string;
}

export interface OptionListProps {
  readonly items: readonly OptionItem[];
  readonly selectedIndex: number;
  /** Dim every row, used while something else is in flight. */
  readonly dimmed?: boolean;
}

/** Keyboard driven list with the `❯` cursor used across the wizard. */
export function OptionList({ items, selectedIndex, dimmed = false }: OptionListProps) {
  return (
    <Box flexDirection="column">
      {items.map((item, index) => {
        const selected = index === selectedIndex;

        return (
          <Box key={item.id} flexDirection="column">
            <Box>
              <Text color={selected ? theme.color.coffee : theme.color.faint}>
                {selected ? '❯ ' : '  '}
              </Text>
              <Text
                bold={selected}
                underline={selected}
                color={selected ? theme.color.cream : theme.color.muted}
                dimColor={dimmed && !selected}
              >
                {item.label}
              </Text>
              {item.hint ? <Text color={theme.color.faint}> {item.hint}</Text> : null}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

export interface StatRowProps {
  readonly label: string;
  readonly value: string;
  readonly valueColor?: string;
  readonly width: number;
}

/** A `label ................ value` row for the dashboard. */
export function StatRow({ label, value, valueColor = theme.color.cream, width }: StatRowProps) {
  return (
    <Box justifyContent="space-between" width={width}>
      <Text color={theme.color.muted}>{label}</Text>
      <Text color={valueColor}>{value}</Text>
    </Box>
  );
}
