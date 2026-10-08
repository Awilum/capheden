# Security Policy

## Security Philosophy

Cà Phê Đen is a local CLI that controls macOS's native `caffeinate`. Its security posture is intentionally minimal:

- No network access
- No telemetry, analytics, or remote code execution
- Runs with your user privileges (no sudo/root required)
- Uses `child_process.spawn()` with explicit argument arrays (no shell interpolation)

## Supported Versions

Only the latest released version receives security fixes. For now, this is `0.1.x`.

## Reporting a Vulnerability

Report security vulnerabilities privately via [GitHub Security Advisories](https://github.com/Awilum/capheden/security/advisories). Please do not file a public issue for security concerns.

Include as much detail as possible:

- Affected version(s)
- Reproduction steps
- Impact assessment
- Suggested fix (if any)

## What We Expect

We ask that reporters:

- Act in good faith and avoid privacy violations, data destruction, or service disruption
- Give reasonable time for investigation and remediation
- Avoid public disclosure until a fix is released

## Runtime Security Considerations

- **Input validation**: CLI arguments and custom durations are strictly validated. Malformed inputs are rejected with clear errors.
- **Process execution**: `caffeinate` is spawned via `spawn()` with explicit arrays. No `eval`, `Function`, or string concatenation into shell commands.
- **Platform constraints**: The app is macOS-only and expects `/usr/bin/caffeinate`. On unsupported platforms, it fails gracefully.
- **Cleanup & lifecycle**: Signal handlers and exit hooks ensure `caffeinate` is terminated. Cleanup is idempotent; in rare cases we fall back to SIGKILL as a last resort.
- **Dependencies**: We minimize runtime dependencies (Ink, React). Dev dependencies are used for building, testing, linting, and formatting.
- **No secrets**: The codebase contains no API keys, tokens, passwords, or credentials.

## Dependency Security

- `npm audit` runs in CI with a high-severity threshold
- Transitive dependencies are reviewed when upgrading
- Major version upgrades are evaluated for security impact

## Known Limitations

- The interactive UI requires a TTY (raw mode). This is expected CLI behavior, not a security issue.
- If the system's `caffeinate` binary is replaced or tampered with, behavior changes accordingly — that's outside this project's control.

## Acknowledgments

We appreciate responsible disclosure and will credit reporters in release notes when appropriate (with permission).
