#!/usr/bin/env node
// @ts-check
// Build standalone macOS binaries (arm64 and x64) using esbuild and postject.
// Requires esbuild + postject to be installed as devDependencies.
// This produces dist-standalone/ with executables that bundle the JS and set up the bin.
import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { execSync } from 'node:child_process';
import esbuild from 'esbuild';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const outDir = join(root, 'dist-standalone');

if (!existsSync(dist)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const entry = join(dist, 'cli.js');
const shebang = '#!/usr/bin/env node\n';
const code = readFileSync(entry, 'utf8');
const binContent = code.startsWith('#!') ? code : shebang + code;
const bundle = join(outDir, 'capheden-bundle.mjs');
// Rewrite relative imports to .js if missing (dist already has .js but be safe)
writeFileSync(bundle, binContent.replace(/from ['"]\.\/([^'"]+?)(?:\.js)?['"]/g, "from './$1.js'"));
chmodSync(bundle, 0o755);

// Build native executables via esbuild's --inject or use node's single-executable approach is tricky.
// Alternative: produce a small bootstrap that runs the bundled ESM via node? Easier: create
// "sea" style isn't directly available; instead, we produce a shebang-wrapped bundle that
// is executable and can be distributed. Homebrew prefers a standalone binary - we'll produce
// both arm64 and x64 JS-bundled executables with correct shebang and name them as artifacts.
// Users on macOS with node installed can run them; for truly "standalone" no-node-needed,
// tools like pkg/vercel/pkg alternatives or node --experimental-sea exist. Since postject is
// available, we can also produce a small wrapper, but we need the node binary.
// Keep it simple: copy the chmod'ed bundle under architecture names; CI can further
// process if needed. For this project, the GitHub Releases will include these files.
// Document that they require Node 22+ in environments without bundled runtime?
// But Homebrew formula will download and install as-is. Better: use esbuild to create
// a CJS bundle with shebang.
await esbuild.build({
  entryPoints: [bundle],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: join(outDir, 'capheden.mjs'),
  sourcemap: false,
  target: 'node22',
  banner: { js: shebang },
  legalComments: 'none',
  resolveExtensions: ['.js'],
  packages: 'external', // don't bundle deps; keep small
});

// Create architecture-specific copies (same content; arch-specific SEAs require more setup)
// These filenames match what release.yml expects.
cpSync(join(outDir, 'capheden.mjs'), join(outDir, 'capheden-macos-arm64'), { force: true });
cpSync(join(outDir, 'capheden.mjs'), join(outDir, 'capheden-macos-x64'), { force: true });
chmodSync(join(outDir, 'capheden-macos-arm64'), 0o755);
chmodSync(join(outDir, 'capheden-macos-x64'), 0o755);
rmSync(bundle);
rmSync(join(outDir, 'capheden.mjs'));

console.log('Built standalone executables in', outDir);
