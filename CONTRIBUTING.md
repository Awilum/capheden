# Contributing to Cà Phê Đen

Thank you for helping make Cà Phê Đen better. This guide covers local development, testing, and submission expectations.

## Development setup

- **Node.js**: 22 or later
- **macOS**: strongly recommended for testing against `/usr/bin/caffeinate` (the actual process)
- **Terminal**: a TTY for the interactive UI

## Getting started

```bash
git clone https://github.com/Awilum/capheden.git
cd capheden
npm install
```

## Scripts

| Command                 | Purpose                                                 |
| ----------------------- | ------------------------------------------------------- |
| `npm run dev`           | Run the CLI directly from TypeScript via `tsx`          |
| `npm run build`         | Build with `tsc` (build config) and chmod `dist/cli.js` |
| `npm start`             | Run the built artifact                                  |
| `npm test`              | Run the full test suite (Vitest)                        |
| `npm run test:watch`    | Watch mode                                              |
| `npm run test:coverage` | Generate coverage report                                |
| `npm run typecheck`     | Type-check without emitting files                       |
| `npm run lint`          | Lint with ESLint                                        |
| `npm run lint:fix`      | Auto-fix lint issues                                    |
| `npm run format`        | Format with Prettier                                    |
| `npm run format:check`  | Check formatting                                        |
| `npm run audit`         | npm audit (high severity)                               |

## Coding standards

- **TypeScript strict mode**: prefer explicit types; avoid `any` (only with a documented reason)
- **No unsafe shell**: never interpolate user input into shell strings; use `child_process.spawn` with arrays
- **Security**: no `eval`, `Function`, dynamic code execution, network calls, or telemetry
- **Testing**: mock `child_process.spawn` in unit tests; don't let tests spawn real `caffeinate`
- **Error handling**: don't swallow errors; don't leak stack traces to end users
- **Style**: run `npm run lint && npm run format` before submitting

## Testing

All changes should keep the test suite green. Add tests for new behavior (especially validation, parsing, service lifecycle, and state transitions).

```bash
npm run typecheck && npm run lint && npm run format:check && npm test
```

## Commit messages

Use clear, concise commit messages. Keep them focused on a single change when possible.

## Pull requests

- Keep PRs small and focused
- Include tests for bug fixes or new features
- Update documentation if behavior changes
- Don't include unrelated formatting churn

## Security

If you discover a security vulnerability, please report it privately via GitHub Security Advisories for this repository. Do not open a public issue for security reports.

Thank you for contributing!
