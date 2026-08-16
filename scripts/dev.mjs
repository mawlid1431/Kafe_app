#!/usr/bin/env bun
/**
 * Kafe Eman dev launcher (Bun only).
 *
 *   bun run dev    → API + mobile (Expo QR) + admin dashboard
 *   bun run app    → mobile only (same as expo start — QR in terminal)
 *   bun run admin  → admin only
 *   bun run api    → NestJS backend only
 *
 * The API starts first: both the app and the dashboard read from it, and it is
 * ready in about a second, long before Metro finishes bundling.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const adminDir = path.join(root, 'Admin');
const apiDir = path.join(root, 'backend');

const ADMIN_HOST = 'localhost';
const ADMIN_PORT = 5173;
const ADMIN_URL = `http://${ADMIN_HOST}:${ADMIN_PORT}/login`;
const API_URL = 'http://localhost:4000/api';

/** Wait for Metro + QR before starting admin (Clerk plugins + bundler can take 20–40s). */
const ADMIN_START_DELAY_MS = 30_000;

const modeArg = process.argv[2]?.toLowerCase();
const mode =
  modeArg === 'app' || modeArg === 'admin' || modeArg === 'api' || modeArg === 'dev'
    ? modeArg
    : 'dev';
const runApp = mode === 'dev' || mode === 'app';
const runAdmin = mode === 'dev' || mode === 'admin';
const runApi = mode === 'dev' || mode === 'api';
const runBoth = runApp && runAdmin;

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
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      EXPO_NO_TELEMETRY: '1',
    },
  });
  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`\n  [app] exited with code ${code}\n`);
    }
  });
  children.push(child);
  return child;
}

function runAdminServer({ piped }) {
  const child = spawn('bun', ['run', 'dev'], {
    cwd: adminDir,
    stdio: piped ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      CI: 'false',
      BROWSER: 'none',
    },
  });

  if (piped && child.stdout && child.stderr) {
    prefixStream(child.stdout, 'admin');
    prefixStream(child.stderr, 'admin');
  }

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`\n  [admin] exited with code ${code}\n`);
    }
  });
  children.push(child);
  return child;
}

function runApiServer({ piped }) {
  const child = spawn('bun', ['run', 'dev'], {
    cwd: apiDir,
    stdio: piped ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env },
  });

  if (piped && child.stdout && child.stderr) {
    prefixStream(child.stdout, 'api');
    prefixStream(child.stderr, 'api');
  }

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`\n  [api] exited with code ${code}\n`);
    }
  });
  children.push(child);
  return child;
}

function shutdown() {
  for (const child of children) {
    child.kill('SIGTERM');
  }
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

if (runBoth) {
  console.log('');
  console.log(`  API    → ${API_URL}`);
  console.log('  Mobile → QR code below (wait ~30s for Metro to finish starting)');
  console.log(`  Admin  → ${ADMIN_URL} (starts after mobile is ready)\n`);
  runApiServer({ piped: true });
  runExpo();
  setTimeout(() => {
    console.log(`\n  ── Admin → ${ADMIN_URL}  (login: admin / admin123) ──\n`);
    runAdminServer({ piped: true });
  }, ADMIN_START_DELAY_MS);
} else if (runApp) {
  // No banner — keep terminal identical to running `expo start` directly.
  runExpo();
} else if (runAdmin) {
  console.log('');
  console.log(`  Admin → ${ADMIN_URL}`);
  console.log('  Login → admin / admin123 (after bun run db:seed)');
  console.log(`  Needs the API running: bun run api → ${API_URL}\n`);
  runAdminServer({ piped: false });
} else if (runApi) {
  console.log('');
  console.log(`  API → ${API_URL}\n`);
  runApiServer({ piped: false });
}
