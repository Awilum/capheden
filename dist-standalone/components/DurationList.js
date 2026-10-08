import { jsx as _jsx } from 'react/jsx-runtime';
import { OptionList } from './Header.js';
function toItems(choices) {
  return choices.map((choice) =>
    choice.kind === 'custom'
      ? { id: choice.id, label: choice.label, hint: `(${choice.hint})` }
      : { id: choice.id, label: choice.label },
  );
}
/** The duration menu, with the `❯` cursor following the arrow keys. */
export function DurationList({ choices, selectedIndex }) {
  return _jsx(OptionList, { items: toItems(choices), selectedIndex: selectedIndex });
}
//# sourceMappingURL=DurationList.js.map
