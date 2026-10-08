# Cà Phê Đen ☕

_Cà Phê Đen_ means "black coffee" in Vietnamese.

Strong Vietnamese black coffee wakes you up, keeps you focused, and powers you through a long day. **Cà Phê Đen** does the same for your Mac — it keeps it awake using macOS's native `caffeinate` command.

## Why?

The author drinks strong Vietnamese Cà Phê Đen to stay awake and focused while working in Vietnam. This little CLI is the digital equivalent: a no-fuss way to prevent your Mac from going to sleep while you run long builds, downloads, presentations, or focus sessions.

## Features

- **Interactive wizard**: Launch `capheden` with no arguments and choose your duration through a polished Ink TUI.
- **CLI shortcuts**: Start immediately with `capheden 30m`, `capheden 2h`, `capheden 1h 30m`, or `capheden --until-stopped`.
- **Live dashboard**: See remaining/elapsed/total time, start/end times, mode, and a progress bar. Updates once per second.
- **Indefinite mode**: Keep your Mac awake until you explicitly stop it.
- **Safe process management**: Spawns `caffeinate` via `spawn()` with explicit arguments. Handles SIGINT/SIGTERM/exit with idempotent cleanup to prevent orphaned processes.
- **Keyboard-first**: Navigate with ↑/↓, confirm with Enter, go back with Esc, stop with `s`, quit with `q` or Ctrl+C.
- **macOS-native**: Uses `/usr/bin/caffeinate`. No root required, no system configuration changes.
- **Type-safe**: Strict TypeScript + React + Ink 8.0.0.

## Requirements

- macOS (uses native `caffeinate`)
- Node.js 22 or later
- Terminal with support for raw mode (standard macOS Terminal, iTerm2, Kitty, etc.)

## Installation

### npm (global)

```bash
npm install -g capheden
capheden
```

### Homebrew

> TODO: Homebrew Core may not include this yet. If you maintain a tap, use the example below with the correct owner.

```bash
brew tap <github-owner>/capheden
brew install <github-owner>/capheden/capheden
```

### GitHub Releases

Download the appropriate binary for your architecture from the [Releases page](https://github.com/Awilum/capheden/releases):

- `capheden-macos-arm64` (Apple Silicon)
- `capheden-macos-x64` (Intel)

Verify the SHA256 checksum (`SHA256SUMS.txt`), make it executable, and run it:

```bash
chmod +x capheden-macos-arm64
./capheden-macos-arm64 --help
```

## Usage

```text
# Interactive wizard
capheden

# Timed sessions
capheden 15m
capheden 30m
capheden 90m
capheden 1h
capheden 2h
capheden 4h
capheden 8h
capheden 1h 30m
capheden 4h 15m
capheden 2h 15m

# Indefinite (until you stop)
capheden --until-stopped
capheden -u

# Also prevent display sleep
capheden -d 2h

# Help & version
capheden --help
capheden --version
```

### Interactive controls

- **Wizard**: ↑/↓ navigate · Enter select · Esc back · q quit
- **Active session**: `s` stop · Esc stop · q quit
- **Custom duration**: type `1h 30m`, `90m`, etc. · Enter confirm · Esc back · Ctrl+C quit
- **Everywhere**: Ctrl+C cleanly stops `caffeinate` and exits

## How it works

Cà Phê Đen spawns macOS's `/usr/bin/caffeinate -i` (with optional `-d` and `-t <seconds>`). It keeps a lightweight React/Ink UI ticking the session state, listens for keyboard input, and guarantees cleanup on SIGINT/SIGTERM/exit. The app never shells out unsafely — it uses `child_process.spawn()` with an explicit argument array.

## Limitations

- macOS only. Sleep prevention is provided by `caffeinate`, not a cross-platform abstraction.
- Requires a terminal with raw mode for the interactive TUI.
- If `caffeinate` is missing or not executable, the app will show a clear error message.

## Security & Privacy

- No network access, no telemetry, no analytics.
- No hardcoded secrets, tokens, or passwords.
- CLI arguments and custom durations are strictly validated.
- All process spawning is via `spawn()` with explicit arrays; no `eval`, `Function`, or unsafe shell interpolation.
- `caffeinate` runs with your user privileges (no sudo required).

See [SECURITY.md](SECURITY.md) for more details.

## Development

### Prerequisites

- Node.js 22+
- npm 11+
- macOS (recommended to test against real `caffeinate`)

### Setup

```bash
git clone https://github.com/Awilum/capheden.git
cd capheden
npm install
```

### Scripts

```bash
npm run dev            # Run in development
npm run build          # TypeScript build + executable chmod
npm run start          # Run built CLI
npm test               # Run tests
npm run test:watch     # Watch tests
npm run test:coverage  # Coverage report
npm run typecheck      # TypeScript check
npm run lint            # ESLint
npm run lint:fix       # Auto-fix lint issues
npm run format         # Prettier
npm run format:check   # Check formatting
npm run audit          # npm audit (high severity)
npm run build:standalone # Build standalone binaries (arm64/x64)
```

### Architecture

- `src/app/` — state machine (reducer), runtime injection, theme
- `src/components/` — Ink UI components (dashboard, wizard, screens)
- `src/hooks/` — keyboard, layout, time/session hooks
- `src/services/` — `CaffeinateService` (process), `SessionService` (state), `ProcessLifecycle` (shutdown)
- `src/utils/` — duration parsing, CLI parsing, time formatting, platform helpers

## Testing

The test suite covers duration parsing/formatting/validation, CLI parsing, session state, countdown/time math, CaffeinateService lifecycle (mocked spawn), ProcessLifecycle (injected targets), and a smoke App integration test. All tests mock `child_process.spawn` so they never sleep your Mac.

Run the full suite:

```bash
npm run typecheck && npm run lint && npm run format:check && npm test
```

## Building

```bash
npm run build
node dist/cli.js --help
```

## Standalone Binaries

Standalone binaries can be built with `@esbuild/linux`/`@esbuild/win32`-style tooling isn't needed for macOS; however, for distribution across arm64/x64, use the `build:standalone` script (requires esbuild + postject):

```bash
npm run build:standalone
```

This produces macOS standalone executables bundled with the application code. See the release workflow for full details.

## Release Process

Releases are automated via GitHub Actions on tags (`v*`):

1. Install, typecheck, lint, format-check, test, audit, build
2. Build standalone macOS binaries (arm64 and x64)
3. Generate `SHA256SUMS.txt`
4. Create GitHub Release and upload artifacts

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT © Awilum. See [LICENSE](LICENSE) for details.
