import { CaffeinateService } from '../services/CaffeinateService.js';
import { SessionService } from '../services/SessionService.js';
export function createRuntime(options = {}) {
  return {
    caffeinate: options.caffeinate ?? new CaffeinateService(),
    session: options.session ?? new SessionService({ now: options.now ?? Date.now }),
    now: options.now ?? Date.now,
  };
}
//# sourceMappingURL=runtime.js.map
