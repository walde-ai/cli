import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';

// Build without shebang first
await build({
  entryPoints: ['src/index.ts'],   // CLI entry point
  bundle: true,
  platform: 'node',
  target: 'node18',                // match our target Node version
  format: 'cjs',                   // CommonJS format
  outfile: 'dist/cli.cjs',
  minify: true,
  sourcemap: false,
  external: ['fsevents']           // exclude problematic optional dependencies only
}).catch(() => process.exit(1));

// Add shebang manually (check if it already exists)
const content = readFileSync('dist/cli.cjs', 'utf8');
if (!content.startsWith('#!/usr/bin/env node')) {
  const withShebang = '#!/usr/bin/env node\n' + content;
  writeFileSync('dist/cli.cjs', withShebang);
}

console.log('Built dist/cli.cjs with shebang');
