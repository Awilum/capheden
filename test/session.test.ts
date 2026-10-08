import { describe, it, expect, beforeEach } from 'vitest';
import {
  SessionService,
  IDLE_SESSION,
  selectionDurationMs,
} from '../src/services/SessionService.js';
import type { SessionSelection } from '../src/services/SessionService.js';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    service = new SessionService();
  });

  describe('initial state', () => {
    it('returns IDLE_SESSION', () => {
      const snapshot = service.getSnapshot();
      expect(snapshot).toEqual(IDLE_SESSION);
    });

    it('isActive returns false', () => {
      expect(service.isActive()).toBe(false);
    });
  });

  describe('start', () => {
    it('starts a timed session', () => {
      const selection: SessionSelection = { mode: 'timed', durationMs: 60 * 60 * 1000 };
      const snapshot = service.start(selection, 1000);

      expect(snapshot.status).toBe('active');
      expect(snapshot.mode).toBe('timed');
      expect(snapshot.startedAt).toBe(1000);
      expect(snapshot.endsAt).toBe(1000 + 60 * 60 * 1000);
      expect(snapshot.durationMs).toBe(60 * 60 * 1000);
      expect(snapshot.remainingMs).toBe(60 * 60 * 1000);
      expect(snapshot.elapsedMs).toBe(0);
      expect(snapshot.progress).toBe(0);
    });

    it('starts an indefinite session', () => {
      const selection: SessionSelection = { mode: 'indefinite' };
      const snapshot = service.start(selection, 1000);

      expect(snapshot.status).toBe('active');
      expect(snapshot.mode).toBe('indefinite');
      expect(snapshot.startedAt).toBe(1000);
      expect(snapshot.endsAt).toBe(null);
      expect(snapshot.durationMs).toBe(null);
      expect(snapshot.remainingMs).toBe(Infinity);
      expect(snapshot.elapsedMs).toBe(0);
      expect(snapshot.progress).toBe(0);
    });

    it('isActive returns true after start', () => {
      service.start({ mode: 'timed', durationMs: 1000 });
      expect(service.isActive()).toBe(true);
    });

    it('replaces previous session', () => {
      service.start({ mode: 'timed', durationMs: 1000 }, 1000);
      const snapshot = service.start({ mode: 'timed', durationMs: 2000 }, 2000);
      expect(snapshot.durationMs).toBe(2000);
      expect(snapshot.startedAt).toBe(2000);
    });
  });

  describe('tick', () => {
    it('updates elapsed time for timed session', () => {
      service.start({ mode: 'timed', durationMs: 10000 }, 1000);
      const snapshot = service.tick(2000);

      expect(snapshot.elapsedMs).toBe(1000);
      expect(snapshot.remainingMs).toBe(9000);
      expect(snapshot.progress).toBe(0.1);
      expect(snapshot.status).toBe('active');
    });

    it('marks session as expired when time runs out', () => {
      service.start({ mode: 'timed', durationMs: 1000 }, 1000);
      const snapshot = service.tick(2500);

      expect(snapshot.status).toBe('expired');
      expect(snapshot.remainingMs).toBe(0);
      expect(snapshot.progress).toBe(1);
    });

    it('handles indefinite session', () => {
      service.start({ mode: 'indefinite' }, 1000);
      const snapshot = service.tick(5000);

      expect(snapshot.status).toBe('active');
      expect(snapshot.remainingMs).toBe(Infinity);
      expect(snapshot.elapsedMs).toBe(4000);
      expect(snapshot.progress).toBe(0);
    });

    it('does nothing if no active session', () => {
      const snapshot = service.tick(5000);
      expect(snapshot).toEqual(IDLE_SESSION);
    });

    it('does nothing if session already stopped', () => {
      service.start({ mode: 'timed', durationMs: 10000 }, 1000);
      service.stop();
      const snapshot = service.tick(5000);
      expect(snapshot.status).toBe('stopped');
    });

    it('does nothing if session already expired', () => {
      service.start({ mode: 'timed', durationMs: 1000 }, 1000);
      service.tick(2500);
      const snapshot = service.tick(5000);
      expect(snapshot.status).toBe('expired');
    });
  });

  describe('stop', () => {
    it('stops an active session', () => {
      service.start({ mode: 'timed', durationMs: 10000 }, 1000);
      const snapshot = service.stop();

      expect(snapshot.status).toBe('stopped');
      expect(service.isActive()).toBe(false);
    });

    it('does nothing if session not active', () => {
      const snapshot = service.stop();
      expect(snapshot).toEqual(IDLE_SESSION);
    });

    it('does nothing if session already stopped', () => {
      service.start({ mode: 'timed', durationMs: 10000 }, 1000);
      service.stop();
      const snapshot = service.stop();
      expect(snapshot.status).toBe('stopped');
    });

    it('does nothing if session expired', () => {
      service.start({ mode: 'timed', durationMs: 1000 }, 1000);
      service.tick(2500);
      const snapshot = service.stop();
      expect(snapshot.status).toBe('expired');
    });
  });

  describe('reset', () => {
    it('resets to IDLE_SESSION', () => {
      service.start({ mode: 'timed', durationMs: 10000 }, 1000);
      service.stop();
      const snapshot = service.reset();
      expect(snapshot).toEqual(IDLE_SESSION);
    });
  });
});

describe('selectionDurationMs', () => {
  it('returns duration for timed selection', () => {
    const selection: SessionSelection = { mode: 'timed', durationMs: 5000 };
    expect(selectionDurationMs(selection)).toBe(5000);
  });

  it('returns null for indefinite selection', () => {
    const selection: SessionSelection = { mode: 'indefinite' };
    expect(selectionDurationMs(selection)).toBe(null);
  });
});
