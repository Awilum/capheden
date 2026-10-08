import { jsx as _jsx } from 'react/jsx-runtime';
import process from 'node:process';
import { render } from 'ink';
import { App } from './app/App.js';
import { createRuntime } from './app/runtime.js';
import { APP_DISPLAY_NAME, APP_VERSION } from './constants.js';
import { installShutdownHandlers } from './services/ProcessLifecycle.js';
import { helpText, parseCliArgs } from './utils/cli.js';
import {
  CAFFEINATE_BINARY,
  MISSING_CAFFEINATE_MESSAGE,
  UNSUPPORTED_PLATFORM_MESSAGE,
  isCaffeinateAvailable,
  isMacOS,
} from './utils/platform.js';
/** Environment problems shown in the UI close themselves after this long. */
const BOOT_ERROR_LIFETIME_MS = 8_000;
/**
 * Parse the arguments, boot the UI, keep caffeinate under control.
 *
 * Returns the process exit code so the bin entry stays a two-liner.
 */
export async function run(argv = process.argv.slice(2)) {
  const result = parseCliArgs(argv);
  if (result.kind === 'help') {
    process.stdout.write(`${helpText(APP_VERSION)}\n`);
    return 0;
  }
  if (result.kind === 'version') {
    process.stdout.write(`${APP_VERSION}\n`);
    return 0;
  }
  if (result.kind === 'error') {
    // A typo on the command line should fail fast and stay script friendly.
    process.stderr.write(`${formatPlainError('That did not work', result.message)}\n`);
    return 1;
  }
  const bootError = environmentError();
  if (bootError && !isInteractive()) {
    process.stderr.write(`${formatPlainError(bootError.title, bootError.message)}\n`);
    return 1;
  }
  const startImmediately = result.kind === 'session';
  const runtime = createRuntime();
  let exitCode = 0;
  let bootErrorTimer;
  const finish = (code) => {
    exitCode = code;
    if (bootErrorTimer) clearTimeout(bootErrorTimer);
    // instance is unmounted in finally block
  };
  // Nothing may outlive us: caffeinate dies with the process, always.
  const uninstall = installShutdownHandlers({
    cleanup: () => runtime.caffeinate.cleanup(),
    onShutdown: (_reason, code) => {
      finish(code);
    },
  });
  const instance = render(
    _jsx(App, {
      runtime: runtime,
      initialSelection: startImmediately ? result.selection : null,
      preventDisplaySleep: startImmediately ? result.preventDisplaySleep : false,
      bootError: bootError,
      onExit: finish,
    }),
    {
      // Ctrl+C is handled inside the app so caffeinate is stopped first.
      exitOnCtrlC: false,
      incrementalRendering: process.env['CAPHEDEN_INCREMENTAL'] !== '0',
      alternateScreen: process.env['CAPHEDEN_ALT'] === '1',
    },
  );
  if (bootError) {
    bootErrorTimer = setTimeout(() => finish(1), BOOT_ERROR_LIFETIME_MS);
  }
  try {
    await instance.waitUntilExit();
  } finally {
    uninstall();
    runtime.caffeinate.cleanup();
  }
  return exitCode;
}
function environmentError() {
  if (!isMacOS()) {
    return {
      title: 'macOS only',
      message: UNSUPPORTED_PLATFORM_MESSAGE,
      hint: 'Cà Phê Đen drives the native caffeinate utility, which only exists on macOS.',
    };
  }
  if (!isCaffeinateAvailable()) {
    return {
      title: 'caffeinate not found',
      message: MISSING_CAFFEINATE_MESSAGE,
      hint: `Expected ${CAFFEINATE_BINARY} to exist and be executable.`,
    };
  }
  return undefined;
}
function isInteractive() {
  return process.stdout.isTTY === true && process.stdin.isTTY === true;
}
/** Fallback formatting when we cannot rely on the interactive UI. */
function formatPlainError(title, message) {
  return [
    '',
    `  ☕ ${APP_DISPLAY_NAME} v${APP_VERSION}`,
    '',
    `  ✖ ${title}`,
    `  ${message}`,
    '',
    '',
  ].join('\n');
}
//# sourceMappingURL=run.js.map
