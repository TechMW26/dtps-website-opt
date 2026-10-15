#!/usr/bin/env node
/**
 * Cross-platform launcher for `next dev`.
 *
 * `next dev` runs the actual request-serving server in a child process
 * (`next/dist/server/lib/start-server.js`), so a DNS fallback applied to this
 * process would not reach it. Propagating the preload through NODE_OPTIONS makes
 * every descendant process apply it. See scripts/dev-dns-fallback.cjs for why
 * the fallback is needed at all — it is a no-op when DNS already works.
 *
 * Any extra arguments are forwarded, e.g. `npm run dev -- --port 3001`.
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const scriptsDir = path.dirname(fileURLToPath(import.meta.url));

const preload = path.join(scriptsDir, 'dev-dns-fallback.cjs');
const requireFlag = `--require=${/\s/.test(preload) ? `"${preload}"` : preload}`;

const nextBin = require.resolve('next/dist/bin/next');

const child = spawn(process.execPath, [nextBin, 'dev', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: [process.env.NODE_OPTIONS, requireFlag].filter(Boolean).join(' '),
  },
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
