import { describe, it, expect } from 'vitest';

import {
  isMacOS,
  isCaffeinateAvailable,
  describeAssertions,
  CAFFEINATE_BINARY,
} from '../src/utils/platform.js';

describe('platform', () => {
  describe('isMacOS', () => {
    it('returns true for darwin', () => {
      expect(isMacOS('darwin')).toBe(true);
    });

    it('returns false for non-macOS platforms', () => {
      expect(isMacOS('win32')).toBe(false);
      expect(isMacOS('linux')).toBe(false);
      expect(isMacOS('freebsd')).toBe(false);
    });
  });

  describe('describeAssertions', () => {
    it('describes idle sleep only', () => {
      expect(describeAssertions(false)).toBe('preventing idle sleep');
    });

    it('describes idle and display sleep', () => {
      expect(describeAssertions(true)).toBe('preventing idle sleep + display sleep');
    });
  });

  describe('isCaffeinateAvailable', () => {
    it('returns true for an executable file that exists', () => {
      // The real binary exists on macOS; verify against it in CI context.
      expect(isCaffeinateAvailable(CAFFEINATE_BINARY)).toBe(true);
    });

    it('returns false when the binary cannot be accessed', () => {
      expect(isCaffeinateAvailable('/nope/caffeinate')).toBe(false);
    });
  });
});
