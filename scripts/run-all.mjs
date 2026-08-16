#!/usr/bin/env bun
/**
 * Run the same script in every project.
 *
 *   bun scripts/run-all.mjs typecheck
 *
 * Runs all of them even when one fails, so a single pass surfaces every problem
 * rather than stopping at the first.
 */
import { spawnSync } from 'node:child_process';
import { API_DIR, APP_DIR, WEB_DIR } from './paths.mjs';

const script = process.argv[2];
if (!script) {
  console.error('Usage: bun scripts/run-all.mjs <script-name>');
  process.exit(1);
}

const projects = [
  { name: 'backend', dir: API_DIR },
  { name: 'frontend/app', dir: APP_DIR },
  { name: 'frontend/web', dir: WEB_DIR },
];

const failures = [];

for (const project of projects) {
  console.log(`\n── ${project.name}: ${script} ${'─'.repeat(30)}`);
  const result = spawnSync('bun', ['run', script], {
    cwd: project.dir,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.status !== 0) failures.push(project.name);
}

console.log('');
if (failures.length) {
  console.error(`  ${script} failed in: ${failures.join(', ')}\n`);
  process.exit(1);
}
console.log(`  ${script} passed in all ${projects.length} projects\n`);
