#!/usr/bin/env bun
/**
 * Capture a screenshot from the connected Android device/emulator.
 *
 *   bun scripts/screenshot.mjs home        → docs/screenshots/android-home.png
 *   bun scripts/screenshot.mjs menu --raw  → keep full device resolution
 *
 * Used to produce the images embedded in README.md. Kept in the repo so the
 * screenshots can be regenerated after a UI change instead of going stale.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { androidEnv, findAndroidSdk } from './android-env.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'docs', 'screenshots');

const name = process.argv.slice(2).find((a) => !a.startsWith('--'));
if (!name) {
  console.error('Usage: bun scripts/screenshot.mjs <name>');
  process.exit(1);
}

const sdk = findAndroidSdk();
if (!sdk) {
  console.error('Android SDK not found — install Android Studio.');
  process.exit(1);
}

const adb = path.join(sdk, 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb');
const env = androidEnv();
// /data/local/tmp is always adb-writable; /sdcard is not on newer images where
// scoped storage may not be mounted yet right after boot.
const devicePath = '/data/local/tmp/kafeeman-shot.png';
const outFile = path.join(outDir, `android-${name}.png`);

fs.mkdirSync(outDir, { recursive: true });

// screencap on-device then pull — far more reliable than piping binary PNG
// through adb exec-out on Windows, where the shell mangles CRLF in the stream.
const cap = spawnSync(adb, ['shell', 'screencap', '-p', devicePath], { env, encoding: 'utf8' });
if (cap.status !== 0) {
  console.error(cap.stderr || 'screencap failed — is a device connected?');
  process.exit(1);
}

const pull = spawnSync(adb, ['pull', devicePath, outFile], { env, encoding: 'utf8' });
if (pull.status !== 0) {
  console.error(pull.stderr || 'adb pull failed');
  process.exit(1);
}

spawnSync(adb, ['shell', 'rm', devicePath], { env });

const { size } = fs.statSync(outFile);
console.log(`${path.relative(root, outFile)}  (${Math.round(size / 1024)} KB)`);
