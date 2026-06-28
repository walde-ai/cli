import { build } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

// Ensure dist-dev directory exists
mkdirSync('dist-dev', { recursive: true });

// Build dev entry point
await build({
  entryPoints: ['src/dev.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  outfile: 'dist-dev/cli.cjs',
  minify: false,              // Keep readable for debugging
  sourcemap: true,            // Enable source maps for debugging
  external: ['fsevents', 'esbuild']
}).catch(() => process.exit(1));

// Add shebang
const content = readFileSync('dist-dev/cli.cjs', 'utf8');
if (!content.startsWith('#!/usr/bin/env node')) {
  const withShebang = '#!/usr/bin/env node\n' + content;
  writeFileSync('dist-dev/cli.cjs', withShebang);
}

console.log('Built dist-dev/cli.cjs with shebang');
