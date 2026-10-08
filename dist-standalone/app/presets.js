import { HOUR_MS, MINUTE_MS } from '../utils/duration.js';
/**
 * The wizard menu. Order matters — it is also the keyboard order.
 */
export const DURATION_CHOICES = [
  {
    kind: 'preset',
    id: '15m',
    label: '15 minutes',
    selection: { mode: 'timed', durationMs: 15 * MINUTE_MS },
  },
  {
    kind: 'preset',
    id: '30m',
    label: '30 minutes',
    selection: { mode: 'timed', durationMs: 30 * MINUTE_MS },
  },
  {
    kind: 'preset',
    id: '1h',
    label: '1 hour',
    selection: { mode: 'timed', durationMs: 1 * HOUR_MS },
  },
  {
    kind: 'preset',
    id: '2h',
    label: '2 hours',
    selection: { mode: 'timed', durationMs: 2 * HOUR_MS },
  },
  {
    kind: 'preset',
    id: '4h',
    label: '4 hours',
    selection: { mode: 'timed', durationMs: 4 * HOUR_MS },
  },
  {
    kind: 'preset',
    id: '8h',
    label: '8 hours',
    selection: { mode: 'timed', durationMs: 8 * HOUR_MS },
  },
  {
    kind: 'preset',
    id: 'until-stopped',
    label: 'Until I stop it',
    selection: { mode: 'indefinite' },
  },
  { kind: 'custom', id: 'custom', label: 'Custom duration', hint: 'e.g. 1h 30m' },
];
export const CONFIRMATION_CHOICES = [
  { id: 'start', label: 'Start session' },
  { id: 'change', label: 'Change duration' },
  { id: 'cancel', label: 'Cancel' },
];
export const STOP_CHOICES = [
  { id: 'confirm', label: 'Yes, stop session' },
  { id: 'cancel', label: 'No, keep it running' },
];
export const COMPLETED_CHOICES = [
  { id: 'again', label: 'Start another session' },
  { id: 'exit', label: 'Exit' },
];
export const ERROR_CHOICES = [
  { id: 'retry', label: 'Try again' },
  { id: 'exit', label: 'Exit' },
];
//# sourceMappingURL=presets.js.map
