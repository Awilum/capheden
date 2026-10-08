import { Text } from 'ink';

import { theme } from '../app/theme.js';

export interface KeyHint {
  /** Key label, e.g. `enter` or `↑/↓`. */
  readonly key: string;
  /** What it does, e.g. `select`. */
  readonly label: string;
}

export interface FooterProps {
  readonly hints: readonly KeyHint[];
  /** Optional right aligned brand/version blurb. */
  readonly detail?: string;
}

export function Footer({ hints, detail }: FooterProps) {
  const separator = <Text color={theme.color.faint}>{' · '}</Text>;

  return (
    <Text>
      {hints.map((hint, index) => (
        <Text key={hint.key}>
          {index > 0 ? separator : null}
          <Text color={theme.color.coffee}>{hint.key}</Text>
          <Text color={theme.color.faint}> {hint.label}</Text>
        </Text>
      ))}
      {detail ? <Text color={theme.color.faint}>{`  ${detail}`}</Text> : null}
    </Text>
  );
}
