import { CaffeinateService } from '../services/CaffeinateService.js';
import { SessionService } from '../services/SessionService.js';

/**
 * Everything the UI needs from the outside world, in one injectable bundle.
 * Tests pass fakes, `cli.ts` passes the real thing.
 */
export interface Runtime {
  readonly caffeinate: CaffeinateService;
  readonly session: SessionService;
  readonly now: () => number;
}

export interface CreateRuntimeOptions {
  readonly caffeinate?: CaffeinateService;
  readonly session?: SessionService;
  readonly now?: () => number;
}

export function createRuntime(options: CreateRuntimeOptions = {}): Runtime {
  return {
    caffeinate: options.caffeinate ?? new CaffeinateService(),
    session: options.session ?? new SessionService({ now: options.now ?? Date.now }),
    now: options.now ?? Date.now,
  };
}
