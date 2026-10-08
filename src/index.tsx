/**
 * Public entry point. `capheden` itself is the `cli` bin, this module exists so
 * the app can be embedded or tested without side effects.
 */
export { App, type AppProps } from './app/App.js';
export { createRuntime, type Runtime } from './app/runtime.js';
export {
  createInitialState,
  reducer,
  type AppAction,
  type AppState,
  type Screen,
} from './app/state.js';
export { DURATION_CHOICES } from './app/presets.js';
export { theme } from './app/theme.js';
export type {
  AppError,
  DurationChoice,
  Notice,
  SessionSelection,
  SessionSnapshot,
} from './app/types.js';

export {
  CaffeinateError,
  CaffeinateService,
  type CaffeinateStartOptions,
  type CaffeinateStopResult,
} from './services/CaffeinateService.js';
export { installShutdownHandlers, type ShutdownReason } from './services/ProcessLifecycle.js';
export { IDLE_SESSION, SessionService, selectionDurationMs } from './services/SessionService.js';

export { helpText, parseCliArgs, type CliResult } from './utils/cli.js';
export {
  formatCompact,
  formatSpelled,
  parseDuration,
  validateDuration,
  MAX_DURATION_MS,
  MIN_DURATION_MS,
} from './utils/duration.js';
export {
  CAFFEINATE_BINARY,
  isCaffeinateAvailable,
  isMacOS,
  MISSING_CAFFEINATE_MESSAGE,
  UNSUPPORTED_PLATFORM_MESSAGE,
} from './utils/platform.js';
export { computeCountdown, formatClockDuration, formatClockTime } from './utils/time.js';
export { marqueeRange, steamFrames } from './utils/animation.js';

export { run } from './run.js';
export { APP_DISPLAY_NAME, APP_NAME, APP_TAGLINE, APP_VERSION } from './constants.js';
