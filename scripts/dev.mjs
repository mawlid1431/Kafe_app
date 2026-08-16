#!/usr/bin/env bun
/**
 * Kafe Eman dev launcher (Bun only).
 *
 *   bun run dev    → API + Expo QR + web (landing + admin)
 *   bun run app    → Expo only (same terminal output as `expo start`)
 *   bun run web    → landing + admin dashboard only
 *   bun run api    → NestJS backend only
 *
 * The API starts first: both the app and the dashboard read from it, and it is
 * ready in about a second, long before Metro finishes bundling.
 */
import { spawn } from 'node:child_process';
import { API_DIR, API_URL, REPO_ROOT, WEB_DIR, WEB_URL, loadRootEnv } from './paths.mjs';

loadRootEnv();

/** Metro needs ~30s before the QR is usable; start the web app after that. */
const WEB_START_DELAY_MS = 30_000;

const modeArg = process.argv[2]?.toLowerCase();
const KNOWN = new Set(['app', 'web', 'admin', 'api', 'dev']);
const raw = KNOWN.has(modeArg) ? modeArg : 'dev';
const mode = raw === 'admin' ? 'web' : raw;

const runApp = mode === 'dev' || mode === 'app';
const runWeb = mode === 'dev' || mode === 'web';
const runApi = mode === 'dev' || mode === 'api';
const runBoth = runApp && runWeb;

/** @type {import('node:child_process').ChildProcess[]} */
const children = [];

function prefixStream(stream, label) {
  let buffer = '';
  stream.on('data', (chunk) => {
    buffer += chunk.toString();
    const parts = buffer.split(/\r?\n/);
    buffer = parts.pop() ?? '';
    for (const part of parts) {
      if (part.length > 0) {
        process.stdout.write(`  [${label}] ${part}\n`);
      }
    }
  });
  stream.on('end', () => {
    if (buffer.length > 0) {
      process.stdout.write(`  [${label}] ${buffer}\n`);
    }
  });
}

/** Extra flags after the mode arg (e.g. `bun run dev --clear`) reach expo-start.mjs. */
const expoPassthrough = process.argv.slice(3).filter((a) => a.startsWith('--'));

function runExpo() {
  // Direct script spawn — full interactive TTY, QR renders like `expo start`.
  const child = spawn('bun', ['scripts/expo-start.mjs', ...expoPassthrough], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, EXPO_NO_TELEMETRY: '1' },
  });
  child.on('exit', (code) => {
    if (code !== 0 && code !== null) console.error(`\n  [app] exited with code ${code}\n`);
  });
  children.push(child);
  return child;
}

function runNamed(name, cwd, { piped }) {
  const child = spawn('bun', ['run', 'dev'], {
    cwd,
    stdio: piped ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, CI: 'false', BROWSER: 'none' },
  });

  if (piped && child.stdout && child.stderr) {
    prefixStream(child.stdout, name);
    prefixStream(child.stderr, name);
  }

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) console.error(`\n  [${name}] exited with code ${code}\n`);
  });
  children.push(child);
  return child;
}

function shutdown() {
  for (const child of children) child.kill('SIGTERM');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

if (runBoth) {
  console.log('');
  console.log(`  API    → ${API_URL}`);
  console.log('  Mobile → QR code below (wait ~30s for Metro to finish starting)');
  console.log(`  Web    → ${WEB_URL} (starts after mobile is ready)\n`);
  runNamed('api', API_DIR, { piped: true });
  runExpo();
  setTimeout(() => {
    console.log(`\n  ── Web → ${WEB_URL}  (login: admin / admin123) ──\n`);
    runNamed('web', WEB_DIR, { piped: true });
  }, WEB_START_DELAY_MS);
} else if (runApp) {
  // No banner — keep the terminal identical to running `expo start` directly.
  runExpo();
} else if (runWeb) {
  console.log('');
  console.log(`  Landing → http://localhost:5173/`);
  console.log(`  Admin   → ${WEB_URL}`);
  console.log('  Login   → admin / admin123 (after bun run db:seed)');
  console.log(`  Needs the API running: bun run api → ${API_URL}\n`);
  runNamed('web', WEB_DIR, { piped: false });
} else if (runApi) {
  console.log('');
  console.log(`  API → ${API_URL}\n`);
  runNamed('api', API_DIR, { piped: false });
}
