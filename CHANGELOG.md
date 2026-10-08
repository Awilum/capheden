# Changelog

All notable changes to Cà Phê Đen will be documented in this file.

The format is roughly based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-10-08

### Added

- Interactive terminal TUI (React + Ink 8) to control macOS `caffeinate`
- CLI shortcuts: `capheden 30m`, `capheden 2h`, `1h 30m`, etc., `--until-stopped`, `--help`, `--version`
- Live dashboard with remaining/elapsed/total, start/end, mode, progress bar
- Indefinite mode (until stopped)
- Custom duration parsing with validation (rejects negative/zero/invalid/oversized)
- Keyboard controls (↑/↓, Enter, Esc, s, q, Ctrl+C)
- Robust process management via `CaffeinateService` with spawn/stop/cleanup and signal handling
- Session bookkeeping and countdown logic with unit tests
- Comprehensive test suite (duration, CLI, session, countdown/time, service, lifecycle, platform, App)
- TypeScript strict mode, ESLint + Prettier
- CI-ready quality gates: typecheck, lint, format, test, build
- npm distribution (`capheden` bin, ESM, types, files whitelist)
- Homebrew Formula template and standalone binary build script
- GitHub Actions workflows for CI and release
- Security, contributing, and changelog documentation
