import { jsx as _jsx, jsxs as _jsxs } from 'react/jsx-runtime';
import { useCallback, useEffect, useReducer } from 'react';
import { Box, Static, Text } from 'ink';
import { theme } from './theme.js';
import { createInitialState, reducer } from './state.js';
import { DURATION_CHOICES } from './presets.js';
import { CaffeinateError } from '../services/CaffeinateService.js';
import { useKeyboard } from '../hooks/useKeyboard.js';
import { useLayout } from '../hooks/useLayout.js';
import { useNow } from '../hooks/useNow.js';
import { useSession } from '../hooks/useSession.js';
import { parseDuration, formatSpelled } from '../utils/duration.js';
import { describeAssertions } from '../utils/platform.js';
import { ActiveDashboard } from '../components/ActiveDashboard.js';
import { BusyScreen } from '../components/BusyScreen.js';
import { CompletionScreen } from '../components/CompletionScreen.js';
import { ConfirmationScreen } from '../components/ConfirmationScreen.js';
import { CustomDuration } from '../components/CustomDuration.js';
import { DurationWizard } from '../components/DurationWizard.js';
import { ErrorScreen } from '../components/ErrorScreen.js';
import { Footer } from '../components/Footer.js';
import { StopConfirmation } from '../components/StopConfirmation.js';
import { WelcomeScreen } from '../components/WelcomeScreen.js';
/** How long the intro stays on screen before the wizard takes over. */
const WELCOME_DURATION_MS = 1_600;
export function App({
  runtime,
  initialSelection = null,
  skipWelcome = false,
  preventDisplaySleep = false,
  bootError,
  onExit = () => {},
}) {
  const [state, dispatch] = useReducer(
    reducer,
    { initialSelection, skipWelcome, preventDisplaySleep, bootError },
    (options) => createInitialState(options),
  );
  const { width, innerWidth, border } = useLayout();
  const sessionRunning = state.screen === 'ACTIVE_SESSION';
  const now = useNow(sessionRunning);
  useSession({ service: runtime.session, dispatch, now, isActive: sessionRunning });
  // The welcome screen moves on by itself; any key skips it instantly.
  useEffect(() => {
    if (state.screen !== 'WELCOME') return;
    const timer = setTimeout(() => dispatch({ type: 'ADVANCE' }), WELCOME_DURATION_MS);
    return () => clearTimeout(timer);
  }, [state.screen]);
  // Start caffeinate whenever we enter PREPARING.
  useEffect(() => {
    if (state.screen !== 'PREPARING' || !state.selection) return;
    let cancelled = false;
    const selection = state.selection;
    const start = async () => {
      try {
        const durationMs = selection.mode === 'timed' ? selection.durationMs : undefined;
        const result = await runtime.caffeinate.start({
          durationMs,
          preventDisplaySleep: state.preventDisplaySleep,
          onUnexpectedExit: () => dispatch({ type: 'UNEXPECTED_EXIT' }),
        });
        if (cancelled) {
          void runtime.caffeinate.stop();
          return;
        }
        const snapshot = runtime.session.start(selection, runtime.now());
        dispatch({ type: 'STARTED', session: snapshot, pid: result.pid });
        dispatch({
          type: 'ADD_NOTICE',
          text: `☕ caffeinate running · ${describeAssertions(state.preventDisplaySleep)}${result.pid === undefined ? '' : ` · pid ${result.pid}`}`,
          tone: 'info',
        });
      } catch (error) {
        if (cancelled) return;
        dispatch({ type: 'START_FAILED', error: toAppError(error) });
      }
    };
    void start();
    return () => {
      cancelled = true;
    };
  }, [runtime, state.screen, state.selection, state.preventDisplaySleep]);
  // Stop caffeinate when the user confirms, and on any path that ends a session.
  useEffect(() => {
    if (state.screen !== 'STOPPING' && state.screen !== 'COMPLETED') return;
    let cancelled = false;
    const stop = async () => {
      const result = await runtime.caffeinate.stop();
      const snapshot = runtime.session.stop();
      if (cancelled) return;
      if (result.forced) {
        dispatch({
          type: 'ADD_NOTICE',
          text: '⚠ caffeinate ignored the polite request and was killed.',
          tone: 'warn',
        });
      }
      if (state.screen === 'STOPPING') {
        dispatch({ type: 'STOPPED', session: snapshot });
      }
    };
    void stop();
    return () => {
      cancelled = true;
    };
  }, [runtime, state.screen]);
  // Leaving the app: make sure no caffeinate survives us.
  useEffect(() => {
    if (state.screen !== 'EXIT') return;
    runtime.caffeinate.cleanup();
    onExit(state.exitCode);
  }, [runtime, state.screen, state.exitCode, onExit]);
  useEffect(() => () => runtime.caffeinate.cleanup(), [runtime]);
  const handleKey = useCallback(
    (action) => {
      if (action.type === 'interrupt') {
        dispatch({ type: 'QUIT' });
        return;
      }
      switch (state.screen) {
        case 'WELCOME':
          if (action.type === 'quit') dispatch({ type: 'QUIT' });
          if (action.type === 'select' || action.type === 'text' || action.type === 'back') {
            dispatch({ type: 'ADVANCE' });
          }
          return;
        case 'DURATION_SELECTION':
          if (action.type === 'quit') dispatch({ type: 'QUIT' });
          if (action.type === 'up') dispatch({ type: 'MOVE', delta: -1 });
          if (action.type === 'down') dispatch({ type: 'MOVE', delta: 1 });
          if (action.type === 'pick') dispatch({ type: 'PICK', index: action.index });
          if (action.type === 'select') dispatch({ type: 'SELECT' });
          if (action.type === 'back') dispatch({ type: 'BACK' });
          return;
        case 'CUSTOM_DURATION':
          if (action.type === 'quit') dispatch({ type: 'QUIT' });
          if (action.type === 'back') dispatch({ type: 'BACK' });
          if (action.type === 'delete') {
            dispatch({ type: 'SET_CUSTOM', value: state.customValue.slice(0, -1) });
          }
          // Append, never replace: terminals deliver keystrokes one at a time,
          // while a paste may arrive as a single multi-character chunk.
          if (action.type === 'text') {
            dispatch({ type: 'SET_CUSTOM', value: state.customValue + action.value });
          }
          if (action.type === 'select') submitCustomDuration(state.customValue, dispatch);
          return;
        case 'CONFIRMATION':
          if (action.type === 'quit') dispatch({ type: 'QUIT' });
          if (action.type === 'up') dispatch({ type: 'MOVE', delta: -1 });
          if (action.type === 'down') dispatch({ type: 'MOVE', delta: 1 });
          if (action.type === 'select') dispatch({ type: 'SELECT' });
          if (action.type === 'back') dispatch({ type: 'BACK' });
          return;
        case 'ACTIVE_SESSION':
          if (action.type === 'quit') dispatch({ type: 'QUIT' });
          if (action.type === 'stop' || action.type === 'back')
            dispatch({ type: 'STOP_REQUESTED' });
          return;
        case 'STOP_CONFIRMATION':
          if (action.type === 'quit') dispatch({ type: 'QUIT' });
          if (action.type === 'up') dispatch({ type: 'MOVE', delta: -1 });
          if (action.type === 'down') dispatch({ type: 'MOVE', delta: 1 });
          if (action.type === 'select') dispatch({ type: 'SELECT' });
          if (action.type === 'back') dispatch({ type: 'STOP_CANCELLED' });
          return;
        case 'COMPLETED':
          if (action.type === 'quit') dispatch({ type: 'QUIT' });
          if (action.type === 'up') dispatch({ type: 'MOVE', delta: -1 });
          if (action.type === 'down') dispatch({ type: 'MOVE', delta: 1 });
          if (action.type === 'select') dispatch({ type: 'SELECT' });
          return;
        case 'ERROR':
          if (action.type === 'quit' || action.type === 'select' || action.type === 'back') {
            dispatch({ type: 'QUIT' });
          }
          return;
        default:
          return;
      }
    },
    [state.customValue, state.screen],
  );
  useKeyboard(handleKey, { textMode: state.screen === 'CUSTOM_DURATION' });
  const hints = hintsFor(state.screen);
  return _jsxs(Box, {
    flexDirection: 'column',
    children: [
      _jsx(Static, {
        items: state.notices,
        children: (notice) =>
          _jsx(Text, { color: noticeTone(notice.tone), children: notice.text }, notice.id),
      }),
      _jsxs(Box, {
        flexDirection: 'column',
        alignItems: 'center',
        children: [
          renderScreen(state, { width, innerWidth, border, now }),
          hints.length > 0
            ? _jsx(Box, {
                marginTop: 1,
                justifyContent: 'center',
                children: _jsx(Footer, { hints: hints }),
              })
            : null,
        ],
      }),
    ],
  });
}
function submitCustomDuration(value, dispatch) {
  const parsed = parseDuration(value);
  if (!parsed.ok) {
    dispatch({ type: 'CUSTOM_SUBMITTED', selection: null, message: parsed.error });
    return;
  }
  dispatch({ type: 'CUSTOM_SUBMITTED', selection: { mode: 'timed', durationMs: parsed.ms } });
}
function toAppError(error) {
  if (error instanceof CaffeinateError) {
    return {
      title: 'Could not start caffeinate',
      message: error.message,
      hint: 'Sleep prevention needs the macOS caffeinate utility.',
      retryable: true,
    };
  }
  return {
    title: 'Something went wrong',
    message: error instanceof Error ? error.message : String(error),
    retryable: true,
  };
}
function noticeTone(tone) {
  switch (tone) {
    case 'success':
      return theme.color.awake;
    case 'warn':
      return theme.color.warn;
    case 'error':
      return theme.color.danger;
    default:
      return theme.color.muted;
  }
}
function renderScreen(state, props) {
  switch (state.screen) {
    case 'WELCOME':
      return _jsx(WelcomeScreen, { width: props.width, border: props.border });
    case 'DURATION_SELECTION':
      return _jsx(DurationWizard, {
        width: props.width,
        border: props.border,
        choices: DURATION_CHOICES,
        selectedIndex: state.durationIndex,
        step: 1,
        totalSteps: 2,
      });
    case 'CUSTOM_DURATION': {
      const preview =
        state.customValue.length > 0 && state.customError === null
          ? (() => {
              const parsed = parseDuration(state.customValue);
              return parsed.ok ? formatSpelled(parsed.ms) : null;
            })()
          : null;
      return _jsx(CustomDuration, {
        width: props.width,
        border: props.border,
        value: state.customValue,
        error: state.customError,
        preview: preview,
      });
    }
    case 'CONFIRMATION':
      return state.selection
        ? _jsx(ConfirmationScreen, {
            width: props.width,
            innerWidth: props.innerWidth,
            border: props.border,
            selection: state.selection,
            selectedIndex: state.confirmIndex,
          })
        : _jsx(DurationWizard, {
            width: props.width,
            border: props.border,
            choices: DURATION_CHOICES,
            selectedIndex: state.durationIndex,
            step: 1,
            totalSteps: 2,
          });
    case 'PREPARING':
      return _jsx(BusyScreen, {
        width: props.width,
        border: props.border,
        title: 'Brewing your coffee\u2026',
        detail: 'starting macOS caffeinate',
      });
    case 'ACTIVE_SESSION':
      return _jsx(ActiveDashboard, {
        width: props.width,
        innerWidth: props.innerWidth,
        border: props.border,
        session: state.session,
        pid: state.pid,
        preventDisplaySleep: state.preventDisplaySleep,
        now: props.now,
      });
    case 'STOP_CONFIRMATION':
      return _jsx(StopConfirmation, {
        width: props.width,
        border: props.border,
        selectedIndex: state.stopIndex,
      });
    case 'STOPPING':
      return _jsx(BusyScreen, {
        width: props.width,
        border: props.border,
        title: 'Pouring the last drop\u2026',
        detail: 'letting your Mac sleep normally again',
      });
    case 'COMPLETED':
      return _jsx(CompletionScreen, {
        width: props.width,
        innerWidth: props.innerWidth,
        border: props.border,
        reason: state.completion ?? 'stopped',
        session: state.session,
        selectedIndex: state.completedIndex,
      });
    case 'ERROR':
      return state.error
        ? _jsx(ErrorScreen, {
            width: props.width,
            border: props.border,
            title: state.error.title,
            message: state.error.message,
            hint: state.error.hint,
            retryable: state.error.retryable === true,
          })
        : null;
    default:
      return null;
  }
}
function hintsFor(screen) {
  switch (screen) {
    case 'WELCOME':
      return [
        { key: 'any key', label: 'skip' },
        { key: 'q', label: 'quit' },
      ];
    case 'DURATION_SELECTION':
      return [
        { key: '↑/↓', label: 'navigate' },
        { key: 'enter', label: 'select' },
        { key: 'esc', label: 'back' },
        { key: 'q', label: 'quit' },
      ];
    case 'CUSTOM_DURATION':
      return [
        { key: 'enter', label: 'confirm' },
        { key: 'esc', label: 'back' },
        { key: 'ctrl+c', label: 'quit' },
      ];
    case 'CONFIRMATION':
      return [
        { key: '↑/↓', label: 'navigate' },
        { key: 'enter', label: 'select' },
        { key: 'esc', label: 'back' },
        { key: 'q', label: 'quit' },
      ];
    case 'PREPARING':
    case 'STOPPING':
      return [{ key: 'ctrl+c', label: 'cancel and quit' }];
    case 'ACTIVE_SESSION':
      return [
        { key: 's', label: 'stop session' },
        { key: 'esc', label: 'stop session' },
        { key: 'q', label: 'quit' },
      ];
    case 'STOP_CONFIRMATION':
      return [
        { key: '↑/↓', label: 'navigate' },
        { key: 'enter', label: 'confirm' },
        { key: 'esc', label: 'keep it running' },
        { key: 'q', label: 'quit' },
      ];
    case 'COMPLETED':
      return [
        { key: '↑/↓', label: 'navigate' },
        { key: 'enter', label: 'select' },
        { key: 'q', label: 'quit' },
      ];
    case 'ERROR':
      return [
        { key: 'enter', label: 'quit' },
        { key: 'q', label: 'quit' },
      ];
    default:
      return [];
  }
}
//# sourceMappingURL=App.js.map
