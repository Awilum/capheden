const SIGNAL_CODES = {
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
export function installShutdownHandlers(options) {
  const signals = options.signals ?? ['SIGINT', 'SIGTERM', 'SIGHUP'];
  const target = options.target ?? process;
  const writeError = options.writeError ?? ((message) => void process.stderr.write(`${message}\n`));
  let shuttingDown = false;
  const shutdown = (reason) => {
    const alreadyShuttingDown = shuttingDown;
    shuttingDown = true;
    try {
      options.cleanup();
    } catch {
      // Never let teardown errors hide the real reason we are exiting.
    }
    if (reason === 'exit') return;
    const code = SIGNAL_CODES[reason] ?? 1;
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
  const onUncaught = (error) => {
    const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
    writeError(`Cà Phê Đen hit an unexpected error:\n${message}`);
    shutdown('uncaughtException');
  };
  const onUnhandledRejection = (reason) => {
    const message = reason instanceof Error ? (reason.stack ?? reason.message) : String(reason);
    writeError(`Cà Phê Đen hit an unexpected error:\n${message}`);
    shutdown('unhandledRejection');
  };
  const onExit = () => {
    shutdown('exit');
  };
  target.on('exit', onExit);
  target.on('uncaughtException', onUncaught);
  target.on('unhandledRejection', onUnhandledRejection);
  const signalHandlers = signals.map((signal) => {
    const handler = () => {
      shutdown(signal);
    };
    target.on(signal, handler);
    return [signal, handler];
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
//# sourceMappingURL=ProcessLifecycle.js.map
