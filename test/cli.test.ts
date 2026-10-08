import { describe, it, expect } from 'vitest';
import { parseCliArgs, helpText } from '../src/utils/cli.js';
import type { CliResult } from '../src/utils/cli.js';

/** Fail fast unless the CLI result is a timed session; returns its duration. */
function timedMs(result: CliResult): number {
  if (result.kind !== 'session' || result.selection.mode !== 'timed') {
    throw new Error(`expected a timed session, got ${JSON.stringify(result)}`);
  }
  return result.selection.durationMs;
}

describe('parseCliArgs', () => {
  describe('help flags', () => {
    it('returns help for -h', () => {
      const result = parseCliArgs(['-h']);
      expect(result.kind).toBe('help');
    });

    it('returns help for --help', () => {
      const result = parseCliArgs(['--help']);
      expect(result.kind).toBe('help');
    });
  });

  describe('version flags', () => {
    it('returns version for -v', () => {
      const result = parseCliArgs(['-v']);
      expect(result.kind).toBe('version');
    });

    it('returns version for -V', () => {
      const result = parseCliArgs(['-V']);
      expect(result.kind).toBe('version');
    });

    it('returns version for --version', () => {
      const result = parseCliArgs(['--version']);
      expect(result.kind).toBe('version');
    });
  });

  describe('until-stopped flags', () => {
    it('returns indefinite session for -u', () => {
      const result = parseCliArgs(['-u']);
      expect(result.kind).toBe('session');
      if (result.kind === 'session') {
        expect(result.selection.mode).toBe('indefinite');
      }
    });

    it('returns indefinite session for --until-stopped', () => {
      const result = parseCliArgs(['--until-stopped']);
      expect(result.kind).toBe('session');
      if (result.kind === 'session') {
        expect(result.selection.mode).toBe('indefinite');
      }
    });

    it('returns indefinite session for --until', () => {
      const result = parseCliArgs(['--until']);
      expect(result.kind).toBe('session');
      if (result.kind === 'session') {
        expect(result.selection.mode).toBe('indefinite');
      }
    });

    it('returns indefinite session for --indefinite', () => {
      const result = parseCliArgs(['--indefinite']);
      expect(result.kind).toBe('session');
      if (result.kind === 'session') {
        expect(result.selection.mode).toBe('indefinite');
      }
    });

    it('rejects combining duration with --until-stopped', () => {
      const result = parseCliArgs(['30m', '--until-stopped']);
      expect(result.kind).toBe('error');
      if (result.kind === 'error') {
        expect(result.message).toContain('not both');
      }
    });
  });

  describe('display flags', () => {
    it('sets preventDisplaySleep for -d', () => {
      const result = parseCliArgs(['-d', '30m']);
      expect(result.kind).toBe('session');
      if (result.kind === 'session') {
        expect(result.preventDisplaySleep).toBe(true);
      }
    });

    it('sets preventDisplaySleep for --display', () => {
      const result = parseCliArgs(['--display', '30m']);
      expect(result.kind).toBe('session');
      if (result.kind === 'session') {
        expect(result.preventDisplaySleep).toBe(true);
      }
    });
  });

  describe('duration arguments', () => {
    it('parses 30m', () => {
      expect(timedMs(parseCliArgs(['30m']))).toBe(30 * 60 * 1000);
    });

    it('parses 1h', () => {
      expect(timedMs(parseCliArgs(['1h']))).toBe(60 * 60 * 1000);
    });

    it('parses 2h', () => {
      expect(timedMs(parseCliArgs(['2h']))).toBe(2 * 60 * 60 * 1000);
    });

    it('parses 1h 30m as two arguments', () => {
      expect(timedMs(parseCliArgs(['1h', '30m']))).toBe(90 * 60 * 1000);
    });

    it('parses 4h 15m as two arguments', () => {
      expect(timedMs(parseCliArgs(['4h', '15m']))).toBe(255 * 60 * 1000);
    });

    it('parses 90m', () => {
      expect(timedMs(parseCliArgs(['90m']))).toBe(90 * 60 * 1000);
    });
  });

  describe('invalid arguments', () => {
    it('rejects unknown option', () => {
      const result = parseCliArgs(['--nope']);
      expect(result.kind).toBe('error');
      if (result.kind === 'error') {
        expect(result.message).toContain('Unknown option');
      }
    });

    it('rejects invalid duration', () => {
      const result = parseCliArgs(['2x']);
      expect(result.kind).toBe('error');
      if (result.kind === 'error') {
        expect(result.message).toContain("don't understand");
      }
    });

    it('rejects negative duration', () => {
      const result = parseCliArgs(['-5m']);
      expect(result.kind).toBe('error');
    });

    it('rejects zero duration', () => {
      const result = parseCliArgs(['0']);
      expect(result.kind).toBe('error');
    });

    it('returns wizard for no arguments', () => {
      const result = parseCliArgs([]);
      expect(result.kind).toBe('wizard');
    });
  });

  describe('help text', () => {
    it('includes version', () => {
      const text = helpText('0.1.0');
      expect(text).toContain('0.1.0');
    });

    it('includes usage examples', () => {
      const text = helpText('0.1.0');
      expect(text).toContain('capheden 30m');
      expect(text).toContain('capheden 2h');
    });

    it('includes all duration examples', () => {
      const text = helpText('0.1.0');
      expect(text).toContain('15m');
      expect(text).toContain('1h30m');
    });
  });
});
