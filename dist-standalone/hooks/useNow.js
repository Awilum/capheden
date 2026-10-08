import { useEffect, useState } from 'react';
/**
 * A `Date.now()` that refreshes itself on a fixed interval.
 *
 * Timers are aligned to the wall clock so the countdown flips exactly on the
 * second instead of drifting a few hundred milliseconds per tick.
 */
export function useNow(isActive, intervalMs = 1_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!isActive) return;
    const update = () => setNow(Date.now());
    update();
    let timeout;
    let cancelled = false;
    const schedule = () => {
      const delay = Math.max(16, intervalMs - (Date.now() % intervalMs));
      timeout = setTimeout(() => {
        if (cancelled) return;
        update();
        schedule();
      }, delay);
    };
    schedule();
    return () => {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
    };
  }, [isActive, intervalMs]);
  return now;
}
//# sourceMappingURL=useNow.js.map
