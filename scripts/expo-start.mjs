#!/usr/bin/env bun
/**
 * Start Expo with a stable LAN setup for physical devices (Windows-friendly).
 * - Frees port 8081 from stale Metro processes before starting
 * - Auto-detects Wi-Fi LAN IP (Expo often picks a stale/virtual adapter on Windows)
 * - Override with REACT_NATIVE_PACKAGER_HOSTNAME in .env.local when needed
 * - Pass --clear to reset Metro cache, --tunnel for ngrok (works when LAN/firewall fails)
 */
import { spawn, spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const METRO_PORT = '8081';
const clear = process.argv.includes('--clear');
const tunnel = process.argv.includes('--tunnel');
const offline = process.argv.includes('--offline');

// Windows names Mobile Hotspot / ICS adapters "Local Area Connection* N" — those
// are never reachable from the phone, and VPN adapters hijack the route.
const SKIP_ADAPTER =
  /virtual|hyper-v|vmware|vethernet|wsl|loopback|tailscale|bluetooth|hotspot|npcap|tunnel|clash|zerotier|hamachi|local area connection\*|vpn|proton|wireguard|openvpn|nordlynx/i;

function isPrivateIPv4(ip) {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return false;
  const [a, b] = parts;
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
}

function scoreAdapter(name, ip) {
  let score = 0;
  if (/wi-?fi|wlan|wireless/i.test(name)) score += 100;
  else if (/ethernet/i.test(name) && !/virtual/i.test(name)) score += 80;
  if (ip.startsWith('192.168.')) score += 50;
  else if (/^172\.(1[6-9]|2\d|3[01])\./.test(ip)) score += 45;
  else if (ip.startsWith('10.')) score += 40;
  // Windows mobile hotspot / ICS often blocks phone → PC Metro access.
  if (ip.startsWith('192.168.137.')) score -= 60;
  if (ip.startsWith('169.254.')) score -= 100;
  return score;
}

function getActiveLanIps() {
  const ips = new Set();
  for (const [name, addrs] of Object.entries(os.networkInterfaces())) {
    if (!addrs || SKIP_ADAPTER.test(name)) continue;
    for (const addr of addrs) {
      const family = addr.family;
      if (family !== 'IPv4' && family !== 4) continue;
      if (addr.internal) continue;
      if (!isPrivateIPv4(addr.address)) continue;
      ips.add(addr.address);
    }
  }
  return ips;
}

function detectLanHost() {
  const fromEnv = process.env.REACT_NATIVE_PACKAGER_HOSTNAME?.trim();
  const activeIps = getActiveLanIps();

  if (fromEnv && activeIps.has(fromEnv)) {
    return { ip: fromEnv, source: 'REACT_NATIVE_PACKAGER_HOSTNAME' };
  }

  if (fromEnv) {
    console.warn('');
    console.warn(`  Warning: REACT_NATIVE_PACKAGER_HOSTNAME=${fromEnv} is not on this PC.`);
    console.warn(`  Active LAN IPs: ${[...activeIps].join(', ') || 'none'}`);
    console.warn('  Update .env.local or remove the line to use auto-detection.\n');
  }

  const candidates = [];
  for (const [name, addrs] of Object.entries(os.networkInterfaces())) {
    if (!addrs || SKIP_ADAPTER.test(name)) continue;
    for (const addr of addrs) {
      const family = addr.family;
      if (family !== 'IPv4' && family !== 4) continue;
      if (addr.internal) continue;
      if (!isPrivateIPv4(addr.address)) continue;
      candidates.push({
        ip: addr.address,
        name,
        score: scoreAdapter(name, addr.address),
      });
    }
  }

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];
  if (!best) return { ip: undefined, source: 'none' };
  return { ip: best.ip, source: best.name };
}

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
if (offline) {
  args.push('--offline');
} else if (tunnel) {
  args.push('--tunnel');
} else {
  args.push('--lan');
}
if (clear) {
  args.push('--clear');
}

const lan = tunnel ? { ip: undefined, source: 'tunnel' } : detectLanHost();
if (!tunnel && lan.ip) {
  console.log('');
  console.log(`  Mobile → exp://${lan.ip}:${METRO_PORT}  (${lan.source})`);
  console.log('  Scan the QR below with Expo Go — phone must be on the same Wi‑Fi.\n');
} else if (!tunnel) {
  console.warn('\n  Warning: could not detect a LAN IP. Set REACT_NATIVE_PACKAGER_HOSTNAME in .env.local\n');
}

const childEnv = {
  ...process.env,
  CI: 'false',
  EXPO_NO_TELEMETRY: '1',
  // Avoid Expo CLI fetch-cache race ("Body has already been read") during dependency checks.
  EXPO_NO_CACHE: '1',
  RCT_METRO_PORT: METRO_PORT,
};

if (!tunnel && lan.ip) {
  childEnv.REACT_NATIVE_PACKAGER_HOSTNAME = lan.ip;
}

function startExpo(startArgs) {
  return new Promise((resolve) => {
    const child = spawn('bunx', startArgs, {
      cwd: root,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: childEnv,
    });
    child.on('exit', (code) => resolve(code ?? 0));
  });
}

process.exit(await startExpo(args));
