#!/usr/bin/env bun
/**
 * One-command setup for a fresh clone.
 *
 *   bun run setup
 *
 * Installs dependencies for all three projects. They are deliberately NOT a Bun
 * workspace: Metro resolves modules from the app's own node_modules, and
 * hoisting has a habit of breaking React Native builds on Windows.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { API_DIR, APP_DIR, REPO_ROOT, WEB_DIR } from './paths.mjs';

const projects = [
  { name: 'backend  (NestJS API)', dir: API_DIR },
  { name: 'frontend/app  (Expo)', dir: APP_DIR },
  { name: 'frontend/web  (landing + admin)', dir: WEB_DIR },
];

let failed = false;

for (const project of projects) {
  console.log(`\n── Installing ${project.name} ${'─'.repeat(20)}`);
  const result = spawnSync('bun', ['install'], {
    cwd: project.dir,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) {
    failed = true;
    console.error(`  Install failed for ${project.name}`);
  }
}

console.log('');

if (!fs.existsSync(path.join(REPO_ROOT, '.env.local'))) {
  console.log('  Next: copy .env.example → .env.local and fill in your keys.');
}
if (!fs.existsSync(path.join(API_DIR, '.env'))) {
  console.log('  Next: copy backend/.env.example → backend/.env (Neon + Cloudinary).');
}

console.log(`
  Then:
    bun run db:migrate    apply the schema to Neon
    bun run db:seed       branches, menu, promos, demo orders, admin user
    bun run dev           API + Expo QR + web
`);

process.exit(failed ? 1 : 0);
