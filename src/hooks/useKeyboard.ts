import { useEffect, useRef } from 'react';
import { useInput, type Key } from 'ink';

/** Everything the app can react to, independent of which screen is showing. */
export type KeyAction =
  | { readonly type: 'up' }
  | { readonly type: 'down' }
  | { readonly type: 'select' }
  | { readonly type: 'back' }
  | { readonly type: 'quit' }
  | { readonly type: 'interrupt' }
  | { readonly type: 'stop' }
  | { readonly type: 'pick'; readonly index: number }
  | { readonly type: 'text'; readonly value: string }
  /** Delete the last typed character. Only produced in text mode. */
  | { readonly type: 'delete' }
  | { readonly type: 'ignore' };

export interface KeyboardOptions {
  readonly active?: boolean;
  /** When typing, printable keys become text instead of shortcuts. */
  readonly textMode?: boolean;
}

/** Pure key translation, unit tested without a terminal. */
export function resolveKeyAction(input: string, key: Key, textMode: boolean): KeyAction {
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

function isPrintable(input: string, key: Key): boolean {
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
export function useKeyboard(
  onAction: (action: KeyAction) => void,
  options: KeyboardOptions = {},
): void {
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
