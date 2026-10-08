import { useMemo } from 'react';
import { computeCountdown } from '../utils/time.js';
/**
 * Live countdown values for a session.
 *
 * Pure derivation from timestamps, so it stays correct after a suspend/resume
 * cycle instead of drifting like a decrementing counter would.
 */
export function useCountdown(session, now) {
  return useMemo(
    () => computeCountdown({ startedAt: session.startedAt, endsAt: session.endsAt, now }),
    [session.startedAt, session.endsAt, now],
  );
}
//# sourceMappingURL=useCountdown.js.map
