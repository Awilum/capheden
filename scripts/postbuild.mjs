// @ts-check
// Makes the compiled bin directly executable after `npm run build`.
import { chmodSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const bin = join(root, 'dist', 'cli.js');

if (!existsSync(bin)) {
  console.error(`postbuild: ${bin} was not produced by the compiler`);
  process.exit(1);
}

try {
  chmodSync(bin, 0o755);
} catch (error) {
  // chmod is not meaningful on every platform; a missing bit is not fatal.
  console.warn(`postbuild: could not mark ${bin} executable (${error.message})`);
}
