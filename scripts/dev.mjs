#!/usr/bin/env bun
/**
 * Kafe Eman dev launcher (Bun only).
 *
 *   bun run dev    → mobile (Expo QR) + admin dashboard
 *   bun run app    → mobile only (same as expo start — QR in terminal)
 *   bun run admin  → admin only
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const adminDir = path.join(root, 'Admin');

const ADMIN_HOST = 'localhost';
const ADMIN_PORT = 5173;
const ADMIN_URL = `http://${ADMIN_HOST}:${ADMIN_PORT}/login`;

/** Wait for Metro + QR before starting admin (Clerk plugins + bundler can take 20–40s). */
const ADMIN_START_DELAY_MS = 30_000;

const modeArg = process.argv[2]?.toLowerCase();
const mode =
  modeArg === 'app' || modeArg === 'admin' || modeArg === 'dev' ? modeArg : 'dev';
const runApp = mode === 'dev' || mode === 'app';
const runAdmin = mode === 'dev' || mode === 'admin';
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

function runExpo() {
  // Use project expo script — full interactive TTY, QR renders like `expo start`.
  const child = spawn('bun', ['run', 'expo:dev'], {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...process.env,
      CI: 'false',
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
  console.log('  Mobile → QR code below (wait ~30s for Metro to finish starting)');
  console.log(`  Admin  → ${ADMIN_URL} (starts after mobile is ready)\n`);
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
  console.log('  Login → admin / admin123 (after bun run convex:seed)\n');
  runAdminServer({ piped: false });
}
