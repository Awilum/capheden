export type {
  SessionMode,
  SessionSelection,
  SessionSnapshot,
  SessionStatus,
} from '../services/SessionService.js';

import type { SessionSelection } from '../services/SessionService.js';

/** A row in the duration list. `custom` opens the free-form input instead. */
export type DurationChoice =
  | {
      readonly kind: 'preset';
      readonly id: string;
      readonly label: string;
      readonly selection: SessionSelection;
    }
  | {
      readonly kind: 'custom';
      readonly id: 'custom';
      readonly label: string;
      readonly hint: string;
    };

export interface AppError {
  readonly title: string;
  readonly message: string;
  readonly hint?: string;
  /** Show a "try again" action, e.g. when a spawn failed but might succeed later. */
  readonly retryable?: boolean;
}

export type NoticeTone = 'info' | 'success' | 'warn' | 'error';

export interface Notice {
  readonly id: number;
  readonly text: string;
  readonly tone: NoticeTone;
}
