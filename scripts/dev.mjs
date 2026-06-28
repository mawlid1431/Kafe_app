#!/usr/bin/env node
/**
 * Starts Expo (mobile app) and Admin dashboard together.
 * Mobile: scan QR in terminal (Expo)
 * Admin:  http://localhost:5173/login
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const adminDir = path.join(root, 'Admin');

const ADMIN_URL = 'http://localhost:5173/login';

console.log('\n  Kafe Eman — development\n');
console.log(`  Mobile app  → scan the QR code below (Expo Go)`);
console.log(`  Admin panel → ${ADMIN_URL}`);
console.log(`  Login       → admin / admin123 (after bun run convex:seed)\n`);

function run(cmd, args, cwd, label) {
  const child = spawn(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`[${label}] exited with code ${code}`);
    }
  });
  return child;
}

const expo = run('bunx', ['expo', 'start', '--lan'], root, 'app');
const admin = run('bun', ['run', 'dev'], adminDir, 'admin');

function shutdown() {
  expo.kill('SIGTERM');
  admin.kill('SIGTERM');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
