export type ShutdownReason =
  'SIGINT' | 'SIGTERM' | 'SIGHUP' | 'exit' | 'uncaughtException' | 'unhandledRejection';

/** Signals we treat as a graceful shutdown request. */
export type ShutdownSignal = Extract<ShutdownReason, 'SIGINT' | 'SIGTERM' | 'SIGHUP'>;

/**
 * The slice of `process` this module needs. Injectable so tests can drive
 * signals through a fake instead of actually signalling the test runner.
 */
export interface ShutdownTarget {
  on(event: string, listener: (...args: unknown[]) => void): unknown;
  off(event: string, listener: (...args: unknown[]) => void): unknown;
  exit(code: number): void;
}

export interface ShutdownHandlerOptions {
  /**
   * Synchronous, idempotent teardown of anything that must not outlive us.
   * Must not throw and must not await anything.
   */
  readonly cleanup: () => void;
  /** Graceful shutdown hook. Defaults to `target.exit(code)`. */
  readonly onShutdown?: (reason: ShutdownReason, code: number) => void;
  readonly signals?: readonly ShutdownSignal[];
  /** stderr writer, injectable for tests. */
  readonly writeError?: (message: string) => void;
  /** Defaults to the real `process`. */
  readonly target?: ShutdownTarget;
}

const SIGNAL_CODES: Readonly<Record<ShutdownSignal, number>> = {
  SIGINT: 130,
  SIGTERM: 143,
  SIGHUP: 129,
};

/**
 * Guarantee that `caffeinate` never outlives Cà Phê Đen.
 *
 * - `exit`      → synchronous cleanup only, we cannot await anything any more.
 * - signals     → cleanup, then hand over to the graceful shutdown path.
 * - errors      → cleanup, print a short message, exit non-zero.
 *
 * A second signal while shutting down force-exits immediately, so Ctrl+C twice
 * always works.
 */
export function installShutdownHandlers(options: ShutdownHandlerOptions): () => void {
  const signals = options.signals ?? (['SIGINT', 'SIGTERM', 'SIGHUP'] as const);
  const target: ShutdownTarget = options.target ?? process;
  const writeError =
    options.writeError ?? ((message: string) => void process.stderr.write(`${message}\n`));

  let shuttingDown = false;

  const shutdown = (reason: ShutdownReason): void => {
    const alreadyShuttingDown = shuttingDown;
    shuttingDown = true;

    try {
      options.cleanup();
    } catch {
      // Never let teardown errors hide the real reason we are exiting.
    }

    if (reason === 'exit') return;

    const code = SIGNAL_CODES[reason as ShutdownSignal] ?? 1;

    if (alreadyShuttingDown) {
      // Second signal while already shutting down: force-exit immediately.
      // The `return` only matters for fake targets in tests; the real
      // `process.exit` never comes back.
      target.exit(code);
      return;
    }

    if (options.onShutdown) {
      options.onShutdown(reason, code);
      return;
    }

    target.exit(code);
  };

  const onUncaught = (error: unknown): void => {
    const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
    writeError(`Cà Phê Đen hit an unexpected error:\n${message}`);
    shutdown('uncaughtException');
  };

  const onUnhandledRejection = (reason: unknown): void => {
    const message = reason instanceof Error ? (reason.stack ?? reason.message) : String(reason);
    writeError(`Cà Phê Đen hit an unexpected error:\n${message}`);
    shutdown('unhandledRejection');
  };

  const onExit = (): void => {
    shutdown('exit');
  };

  target.on('exit', onExit);
  target.on('uncaughtException', onUncaught);
  target.on('unhandledRejection', onUnhandledRejection);

  const signalHandlers = signals.map((signal) => {
    const handler = (): void => {
      shutdown(signal);
    };
    target.on(signal, handler);
    return [signal, handler] as const;
  });

  return () => {
    target.off('exit', onExit);
    target.off('uncaughtException', onUncaught);
    target.off('unhandledRejection', onUnhandledRejection);

    for (const [signal, handler] of signalHandlers) {
      target.off(signal, handler);
    }
  };
}
