import { useEffect, useState } from 'react';

/**
 * A `Date.now()` that refreshes itself on a fixed interval.
 *
 * Timers are aligned to the wall clock so the countdown flips exactly on the
 * second instead of drifting a few hundred milliseconds per tick.
 */
export function useNow(isActive: boolean, intervalMs = 1_000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!isActive) return;

    const update = (): void => setNow(Date.now());
    update();

    let timeout: NodeJS.Timeout | undefined;
    let cancelled = false;

    const schedule = (): void => {
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
