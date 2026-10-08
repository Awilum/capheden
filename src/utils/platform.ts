import { accessSync, constants } from 'node:fs';

/** macOS ships `caffeinate` here; it is part of the base system. */
export const CAFFEINATE_BINARY = '/usr/bin/caffeinate';

export const UNSUPPORTED_PLATFORM_MESSAGE =
  'Cà Phê Đen requires macOS because it drives the native caffeinate utility.';

export const MISSING_CAFFEINATE_MESSAGE = `Could not find the macOS caffeinate utility at ${CAFFEINATE_BINARY}.`;

/** Sleep prevention is implemented exclusively through macOS `caffeinate`. */
export function isMacOS(platform: NodeJS.Platform = process.platform): boolean {
  return platform === 'darwin';
}

export function isCaffeinateAvailable(binaryPath: string = CAFFEINATE_BINARY): boolean {
  try {
    accessSync(binaryPath, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

/** Human readable explanation of what caffeinate is currently holding on our behalf. */
export function describeAssertions(preventDisplaySleep: boolean): string {
  return preventDisplaySleep ? 'preventing idle sleep + display sleep' : 'preventing idle sleep';
}
