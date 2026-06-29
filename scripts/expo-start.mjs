#!/usr/bin/env bun
/**
 * Start Expo with a stable LAN setup for physical devices (Windows-friendly).
 * - Frees port 8081 from stale Metro processes before starting
 * - Uses REACT_NATIVE_PACKAGER_HOSTNAME from .env.local when set
 * - Pass --clear to reset Metro cache, --tunnel for ngrok (works when LAN/firewall fails)
 */
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const METRO_PORT = '8081';
const clear = process.argv.includes('--clear');
const tunnel = process.argv.includes('--tunnel');

function pidsOnPort(port) {
  if (process.platform === 'win32') {
    const result = spawnSync('netstat', ['-ano'], { encoding: 'utf8', shell: true });
    const pids = new Set();
    for (const line of result.stdout?.split('\n') ?? []) {
      if (!line.includes(`:${port}`) || !line.includes('LISTENING')) continue;
      const pid = line.trim().split(/\s+/).pop();
      if (pid && /^\d+$/.test(pid)) pids.add(pid);
    }
    return [...pids];
  }
  const result = spawnSync('lsof', ['-ti', `tcp:${port}`], { encoding: 'utf8' });
  return (result.stdout ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

function freePort(port) {
  for (const pid of pidsOnPort(port)) {
    if (process.platform === 'win32') {
      spawnSync('taskkill', ['/F', '/PID', pid], { shell: true, stdio: 'ignore' });
    } else {
      spawnSync('kill', ['-9', pid], { stdio: 'ignore' });
    }
  }
}

freePort(METRO_PORT);

const args = ['expo', 'start', '--port', METRO_PORT];
if (tunnel) {
  args.push('--tunnel');
} else {
  args.push('--lan');
}
if (clear) {
  args.push('--clear');
}

const child = spawn('bunx', args, {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: {
    ...process.env,
    CI: 'false',
    EXPO_NO_TELEMETRY: '1',
    RCT_METRO_PORT: METRO_PORT,
  },
});

child.on('exit', (code) => process.exit(code ?? 0));
