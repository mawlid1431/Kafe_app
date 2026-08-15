#!/usr/bin/env bun
/**
 * Locate the Android SDK and build an env that Expo/Gradle can actually use.
 *
 * Android Studio installs the SDK but does not set ANDROID_HOME or put
 * platform-tools/emulator on PATH, so `expo run:android` reports "no devices"
 * even with a working AVD. Rather than requiring a system env-var change, we
 * detect the SDK and inject it into the child process only.
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

function candidateSdkPaths() {
  const home = os.homedir();
  const list = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk'),
    path.join(home, 'AppData', 'Local', 'Android', 'Sdk'),
    path.join(home, 'Library', 'Android', 'sdk'),
    path.join(home, 'Android', 'Sdk'),
    '/usr/local/lib/android/sdk',
  ];
  return list.filter(Boolean);
}

/** A directory only counts as an SDK if platform-tools (adb) is present. */
function isSdk(dir) {
  try {
    return fs.existsSync(path.join(dir, 'platform-tools'));
  } catch {
    return false;
  }
}

export function findAndroidSdk() {
  for (const dir of candidateSdkPaths()) {
    if (isSdk(dir)) return dir;
  }
  return undefined;
}

/** List AVDs by shelling the emulator binary directly (it need not be on PATH). */
export function listAvds(sdk) {
  if (!sdk) return [];
  const bin = path.join(sdk, 'emulator', process.platform === 'win32' ? 'emulator.exe' : 'emulator');
  if (!fs.existsSync(bin)) return [];
  const out = spawnSync(bin, ['-list-avds'], { encoding: 'utf8' });
  return (out.stdout ?? '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('INFO'));
}

/**
 * Returns process.env plus ANDROID_HOME/ANDROID_SDK_ROOT and an augmented PATH.
 * Falls back to the unmodified env when no SDK is installed, so callers can
 * still run and let Expo print its own guidance.
 */
export function androidEnv(base = process.env) {
  const sdk = findAndroidSdk();
  if (!sdk) return { ...base };

  const sep = process.platform === 'win32' ? ';' : ':';
  const extraPaths = [
    path.join(sdk, 'platform-tools'),
    path.join(sdk, 'emulator'),
    path.join(sdk, 'cmdline-tools', 'latest', 'bin'),
  ].filter((p) => fs.existsSync(p));

  const pathKey = Object.keys(base).find((k) => k.toLowerCase() === 'path') ?? 'PATH';
  const currentPath = base[pathKey] ?? '';
  const missing = extraPaths.filter((p) => !currentPath.split(sep).includes(p));

  return {
    ...base,
    ANDROID_HOME: sdk,
    ANDROID_SDK_ROOT: sdk,
    [pathKey]: [currentPath, ...missing].filter(Boolean).join(sep),
  };
}
