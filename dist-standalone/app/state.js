import { IDLE_SESSION } from '../services/SessionService.js';
import {
  COMPLETED_CHOICES,
  CONFIRMATION_CHOICES,
  DURATION_CHOICES,
  STOP_CHOICES,
} from './presets.js';
export function createInitialState(options = {}) {
  const base = {
    screen: 'WELCOME',
    welcomeSeen: false,
    durationIndex: 0,
    customValue: '',
    customError: null,
    confirmIndex: 0,
    stopIndex: 0,
    completedIndex: 0,
    selection: null,
    session: IDLE_SESSION,
    completion: null,
    error: null,
    notices: [],
    pid: undefined,
    preventDisplaySleep: options.preventDisplaySleep ?? false,
    exitCode: 0,
  };
  if (options.bootError) {
    return { ...base, screen: 'ERROR', error: options.bootError, welcomeSeen: true, exitCode: 1 };
  }
  if (options.initialSelection) {
    return {
      ...base,
      screen: 'PREPARING',
      welcomeSeen: true,
      selection: options.initialSelection,
    };
  }
  if (options.skipWelcome) {
    return { ...base, screen: 'DURATION_SELECTION', welcomeSeen: true };
  }
  return base;
}
const wrap = (index, length) => {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
};
export function reducer(state, action) {
  switch (action.type) {
    case 'ADVANCE':
      return state.screen === 'WELCOME'
        ? { ...state, screen: 'DURATION_SELECTION', welcomeSeen: true }
        : state;
    case 'MOVE': {
      switch (state.screen) {
        case 'DURATION_SELECTION':
          return {
            ...state,
            durationIndex: wrap(state.durationIndex + action.delta, DURATION_CHOICES.length),
          };
        case 'CONFIRMATION':
          return {
            ...state,
            confirmIndex: wrap(state.confirmIndex + action.delta, CONFIRMATION_CHOICES.length),
          };
        case 'STOP_CONFIRMATION':
          return { ...state, stopIndex: wrap(state.stopIndex + action.delta, STOP_CHOICES.length) };
        case 'COMPLETED':
          return {
            ...state,
            completedIndex: wrap(state.completedIndex + action.delta, COMPLETED_CHOICES.length),
          };
        default:
          return state;
      }
    }
    case 'PICK':
      return state.screen === 'DURATION_SELECTION'
        ? { ...state, durationIndex: wrap(action.index, DURATION_CHOICES.length) }
        : state;
    case 'SELECT':
      return handleSelect(state);
    case 'BACK':
      return handleBack(state);
    case 'SET_CUSTOM':
      return state.screen === 'CUSTOM_DURATION'
        ? { ...state, customValue: action.value, customError: null }
        : state;
    case 'CUSTOM_SUBMITTED': {
      if (state.screen !== 'CUSTOM_DURATION') return state;
      if (action.selection === null) {
        return { ...state, customError: action.message ?? 'That duration does not look right.' };
      }
      return {
        ...state,
        screen: 'CONFIRMATION',
        confirmIndex: 0,
        selection: action.selection,
        customError: null,
      };
    }
    case 'STARTED':
      return {
        ...state,
        screen: 'ACTIVE_SESSION',
        session: action.session,
        pid: action.pid,
        error: null,
      };
    case 'START_FAILED':
      return { ...state, screen: 'ERROR', error: action.error };
    case 'TICK': {
      if (state.screen !== 'ACTIVE_SESSION') return state;
      if (action.session.status === 'expired') {
        return {
          ...state,
          screen: 'COMPLETED',
          session: action.session,
          completion: 'expired',
          completedIndex: 0,
          pid: undefined,
          notices: appendNotice(
            state,
            '☕ Session complete — your Mac can sleep normally again.',
            'success',
          ),
        };
      }
      return { ...state, session: action.session };
    }
    case 'UNEXPECTED_EXIT':
      return {
        ...state,
        screen: 'COMPLETED',
        completion: 'unexpected',
        completedIndex: 0,
        pid: undefined,
        notices: appendNotice(
          state,
          '⚠ caffeinate exited unexpectedly — your Mac can sleep normally again.',
          'warn',
        ),
      };
    case 'STOP_REQUESTED':
      return state.screen === 'ACTIVE_SESSION'
        ? { ...state, screen: 'STOP_CONFIRMATION', stopIndex: 0 }
        : state;
    case 'STOP_CANCELLED':
      return state.screen === 'STOP_CONFIRMATION' ? { ...state, screen: 'ACTIVE_SESSION' } : state;
    case 'STOP_CONFIRMED':
      return state.screen === 'STOP_CONFIRMATION' ? { ...state, screen: 'STOPPING' } : state;
    case 'STOPPED':
      return {
        ...state,
        screen: 'COMPLETED',
        session: action.session,
        completion: 'stopped',
        completedIndex: 0,
        pid: undefined,
        notices: appendNotice(
          state,
          '✓ Session stopped — your Mac can sleep normally again.',
          'success',
        ),
      };
    case 'RESTART':
      return restartState(state);
    case 'RETRY':
      return retryState(state);
    case 'ADD_NOTICE':
      return { ...state, notices: appendNotice(state, action.text, action.tone) };
    case 'QUIT':
      return { ...state, screen: 'EXIT' };
    default:
      return state;
  }
}
function handleSelect(state) {
  switch (state.screen) {
    case 'DURATION_SELECTION': {
      const choice = DURATION_CHOICES[state.durationIndex];
      if (choice === undefined) return state;
      if (choice.kind === 'custom') {
        return { ...state, screen: 'CUSTOM_DURATION', customError: null };
      }
      return { ...state, screen: 'CONFIRMATION', confirmIndex: 0, selection: choice.selection };
    }
    case 'CONFIRMATION': {
      const choice = CONFIRMATION_CHOICES[state.confirmIndex];
      if (choice === undefined) return state;
      switch (choice.id) {
        case 'start':
          return { ...state, screen: 'PREPARING' };
        case 'change':
          return { ...state, screen: 'DURATION_SELECTION', confirmIndex: 0 };
        default:
          return { ...state, screen: 'EXIT' };
      }
    }
    case 'STOP_CONFIRMATION': {
      const choice = STOP_CHOICES[state.stopIndex];
      if (choice === undefined) return state;
      return choice.id === 'confirm'
        ? { ...state, screen: 'STOPPING' }
        : { ...state, screen: 'ACTIVE_SESSION' };
    }
    case 'COMPLETED': {
      const choice = COMPLETED_CHOICES[state.completedIndex];
      if (choice === undefined) return state;
      return choice.id === 'again' ? restartState(state) : { ...state, screen: 'EXIT' };
    }
    case 'ERROR':
      return retryState(state);
    default:
      return state;
  }
}
function handleBack(state) {
  switch (state.screen) {
    case 'CUSTOM_DURATION':
      return { ...state, screen: 'DURATION_SELECTION', customError: null };
    case 'CONFIRMATION':
      return { ...state, screen: 'DURATION_SELECTION', confirmIndex: 0 };
    case 'STOP_CONFIRMATION':
      return { ...state, screen: 'ACTIVE_SESSION' };
    case 'ERROR':
      return { ...state, screen: 'EXIT', exitCode: 1 };
    case 'DURATION_SELECTION':
      return { ...state, screen: 'WELCOME' };
    default:
      return state;
  }
}
function restartState(state) {
  return {
    ...state,
    screen: state.welcomeSeen ? 'DURATION_SELECTION' : 'WELCOME',
    welcomeSeen: true,
    selection: null,
    session: IDLE_SESSION,
    completion: null,
    error: null,
    confirmIndex: 0,
    stopIndex: 0,
    completedIndex: 0,
    pid: undefined,
  };
}
function retryState(state) {
  if (state.error?.retryable !== true) {
    return { ...state, screen: 'EXIT', exitCode: 1 };
  }
  return state.selection
    ? { ...state, screen: 'PREPARING', error: null }
    : { ...state, screen: state.welcomeSeen ? 'DURATION_SELECTION' : 'WELCOME', error: null };
}
function appendNotice(state, text, tone) {
  const lastId = state.notices.at(-1)?.id ?? 0;
  return [...state.notices, { id: lastId + 1, text, tone }];
}
/** The choice currently focused in the duration list. */
export function currentChoice(state) {
  return DURATION_CHOICES[state.durationIndex];
}
//# sourceMappingURL=state.js.map
