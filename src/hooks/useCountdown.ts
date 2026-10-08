import { useMemo } from 'react';

import type { SessionSnapshot } from '../app/types.js';
import { computeCountdown, type Countdown } from '../utils/time.js';

/**
 * Live countdown values for a session.
 *
 * Pure derivation from timestamps, so it stays correct after a suspend/resume
 * cycle instead of drifting like a decrementing counter would.
 */
export function useCountdown(session: SessionSnapshot, now: number): Countdown {
  return useMemo(
    () => computeCountdown({ startedAt: session.startedAt, endsAt: session.endsAt, now }),
    [session.startedAt, session.endsAt, now],
  );
}
