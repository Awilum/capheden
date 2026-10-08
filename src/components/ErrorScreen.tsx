import { Box, Text } from 'ink';

import { APP_DISPLAY_NAME } from '../constants.js';
import { theme } from '../app/theme.js';
import { Panel } from './Panel.js';

export interface ErrorScreenProps {
  readonly width: number;
  readonly border: boolean;
  readonly title: string;
  readonly message: string;
  readonly hint?: string | undefined;
  readonly retryable: boolean;
}

/** Every user facing failure is rendered here, never as a stack trace. */
export function ErrorScreen({ width, border, title, message, hint, retryable }: ErrorScreenProps) {
  return (
    <Panel width={width} border={border} tone="danger">
      <Box flexDirection="column">
        <Box justifyContent="space-between">
          <Text color={theme.color.caramel} bold>
            ☕ {APP_DISPLAY_NAME}
          </Text>
          <Text color={theme.color.danger}>problem</Text>
        </Box>

        <Box height={1} />
        <Box flexDirection="column">
          <Text color={theme.color.danger} bold>
            ✖ {title}
          </Text>
          <Box height={1} />
          <Text color={theme.color.cream}>{message}</Text>
          {hint ? (
            <>
              <Box height={1} />
              <Text color={theme.color.muted}>{hint}</Text>
            </>
          ) : null}
        </Box>

        <Box height={1} />
        <Text color={theme.color.faint}>
          {retryable ? 'enter try again · q quit' : 'press enter or q to quit'}
        </Text>
      </Box>
    </Panel>
  );
}
