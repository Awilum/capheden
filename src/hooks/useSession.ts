import { useEffect } from 'react';

import type { AppAction } from '../app/state.js';
import type { SessionService } from '../services/SessionService.js';

export interface UseSessionOptions {
  readonly service: SessionService;
  readonly dispatch: (action: AppAction) => void;
  /** Timestamp of the current tick, see `useNow`. */
  readonly now: number;
  readonly isActive: boolean;
}

/**
 * Advances the session once per tick and pushes the new snapshot into the state
 * machine, which is what notices expiry and moves us to the completion screen.
 */
export function useSession({ service, dispatch, now, isActive }: UseSessionOptions): void {
  useEffect(() => {
    if (!isActive) return;

    dispatch({ type: 'TICK', session: service.tick(now) });
  }, [service, dispatch, now, isActive]);
}
