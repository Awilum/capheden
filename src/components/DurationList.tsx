import type { DurationChoice } from '../app/types.js';
import { OptionList, type OptionItem } from './Header.js';

export interface DurationListProps {
  readonly choices: readonly DurationChoice[];
  readonly selectedIndex: number;
}

function toItems(choices: readonly DurationChoice[]): OptionItem[] {
  return choices.map((choice) =>
    choice.kind === 'custom'
      ? { id: choice.id, label: choice.label, hint: `(${choice.hint})` }
      : { id: choice.id, label: choice.label },
  );
}

/** The duration menu, with the `❯` cursor following the arrow keys. */
export function DurationList({ choices, selectedIndex }: DurationListProps) {
  return <OptionList items={toItems(choices)} selectedIndex={selectedIndex} />;
}
