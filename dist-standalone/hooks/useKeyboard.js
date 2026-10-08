import { useEffect, useRef } from 'react';
import { useInput } from 'ink';
/** Pure key translation, unit tested without a terminal. */
export function resolveKeyAction(input, key, textMode) {
  if ((key.ctrl && input === 'c') || input === '\u0003') {
    return { type: 'interrupt' };
  }
  if (key.escape) return { type: 'back' };
  if (key.return) return { type: 'select' };
  if (key.upArrow || key.pageUp) return { type: 'up' };
  if (key.downArrow || key.pageDown) return { type: 'down' };
  // While typing, backspace erases a character; everywhere else it means "back".
  if (key.backspace || key.delete) return textMode ? { type: 'delete' } : { type: 'back' };
  if (textMode && isPrintable(input, key)) {
    return { type: 'text', value: input };
  }
  if (key.ctrl || key.meta || key.super) return { type: 'ignore' };
  if (input === '') return { type: 'ignore' };
  switch (input) {
    case 'q':
      return { type: 'quit' };
    case 's':
      return { type: 'stop' };
    default:
      break;
  }
  if (/^[1-9]$/.test(input)) {
    return { type: 'pick', index: Number.parseInt(input, 10) - 1 };
  }
  return { type: 'ignore' };
}
function isPrintable(input, key) {
  if (input.length === 0 || key.ctrl || key.meta || key.super || key.tab) return false;
  const code = input.codePointAt(0) ?? 0;
  return code >= 0x20 && code !== 0x7f;
}
/**
 * Single keyboard entry point for the whole app.
 *
 * Keeping this in one place is what makes the reducer testable and stops two
 * components from fighting over the same key press.
 */
export function useKeyboard(onAction, options = {}) {
  const { active = true, textMode = false } = options;
  const handler = useRef(onAction);
  useEffect(() => {
    handler.current = onAction;
  }, [onAction]);
  useInput(
    (input, key) => {
      handler.current(resolveKeyAction(input, key, textMode));
    },
    { isActive: active },
  );
}
//# sourceMappingURL=useKeyboard.js.map
