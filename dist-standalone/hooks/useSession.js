import { useEffect } from 'react';
/**
 * Advances the session once per tick and pushes the new snapshot into the state
 * machine, which is what notices expiry and moves us to the completion screen.
 */
export function useSession({ service, dispatch, now, isActive }) {
  useEffect(() => {
    if (!isActive) return;
    dispatch({ type: 'TICK', session: service.tick(now) });
  }, [service, dispatch, now, isActive]);
}
//# sourceMappingURL=useSession.js.map
