#!/usr/bin/env bun
/**
 * Kafe Eman launcher — pick a target from the terminal.
 *
 *   bun run pick            → interactive menu
 *   bun run pick android    → skip the menu (also: ios, emulator, both, admin)
 *
 * Every target runs the SAME code against the SAME Convex backend, so an admin
 * dashboard change shows up live on iOS and Android alike. Only the shell the
 * bundle runs inside differs.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import readline from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

import { androidEnv, findAndroidSdk, listAvds } from './android-env.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
/** --dry-run prints the command instead of running it (used by `bun run pick:test`). */
const dryRun = process.argv.includes('--dry-run');
const passthrough = process.argv
  .slice(2)
  .filter((a) => a.startsWith('--') && a !== '--dry-run');

const TARGETS = [
  {
    key: 'go',
    label: 'Expo Go — QR code',
    hint: 'iPhone + Android phones on the same Wi-Fi. No build needed.',
    run: () => runScript('scripts/expo-start.mjs', passthrough),
  },
  {
    key: 'emulator',
    label: 'Android emulator',
    hint: 'Opens the Android Studio emulator on this PC.',
    needsAndroid: true,
    run: () => runExpo(['start', '--android', ...passthrough], { android: true }),
  },
  {
    key: 'android',
    label: 'Android — native build',
    hint: 'Compiles and installs the real APK on an emulator or USB device.',
    needsAndroid: true,
    run: () => runExpo(['run:android', ...passthrough], { android: true }),
  },
  {
    key: 'ios',
    label: 'iOS — native build',
    hint: 'Requires macOS + Xcode. On Windows use Expo Go or EAS instead.',
    run: () => runExpo(['run:ios', ...passthrough]),
  },
  {
    key: 'both',
    label: 'App + Admin dashboard',
    hint: 'Expo QR plus the admin dashboard on localhost:5173.',
    run: () => runScript('scripts/dev.mjs', ['dev', ...passthrough]),
  },
  {
    key: 'admin',
    label: 'Admin dashboard only',
    hint: 'localhost:5173 — the backend both apps read from.',
    run: () => runScript('scripts/dev.mjs', ['admin']),
  },
];

/** stdio:'inherit' keeps a real TTY so Metro renders its QR code. */
function spawnInherit(cmd, args, { android = false } = {}) {
  if (dryRun) {
    console.log(`  would run: ${cmd} ${args.join(' ')}`);
    console.log(`  android env: ${android ? 'yes (ANDROID_HOME injected)' : 'no'}`);
    return undefined;
  }

  const child = spawn(cmd, args, {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: {
      ...(android ? androidEnv() : process.env),
      CI: 'false',
      EXPO_NO_TELEMETRY: '1',
    },
  });
  child.on('exit', (code) => process.exit(code ?? 0));
  return child;
}

function runScript(script, args) {
  return spawnInherit('bun', [script, ...args]);
}

function runExpo(args, opts) {
  return spawnInherit('bunx', ['expo', ...args], opts);
}

function warnIfAndroidMissing(target) {
  if (!target.needsAndroid) return;

  const sdk = findAndroidSdk();
  if (!sdk) {
    console.warn('\n  Android SDK not found. Install Android Studio, then reopen this terminal.\n');
    return;
  }

  console.log(`\n  Android SDK → ${sdk}`);
  const avds = listAvds(sdk);
  if (avds.length > 0) {
    console.log(`  Emulators   → ${avds.join(', ')}`);
  } else {
    console.log('  Emulators   → none. Create one in Android Studio → Device Manager,');
    console.log('                or connect a phone over USB with debugging on.');
  }

  if (!process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim()) {
    console.log('  Maps        → EXPO_PUBLIC_GOOGLE_MAPS_API_KEY not set; the Android');
    console.log('                map will be grey. Everything else works.');
  }
  console.log('');
}

async function main() {
  const requested = process.argv.slice(2).find((a) => !a.startsWith('--'))?.toLowerCase();
  let target = TARGETS.find((t) => t.key === requested);

  if (!target) {
    if (requested) {
      console.error(`\n  Unknown target "${requested}".`);
    }

    console.log('\n  Kafe Eman — where do you want to run it?\n');
    for (const [i, t] of TARGETS.entries()) {
      console.log(`    ${i + 1}. ${t.label}`);
      console.log(`       ${t.hint}`);
    }
    console.log('');

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
      while (!target) {
        const answer = (await rl.question(`  Choose 1-${TARGETS.length} (or q to quit): `)).trim();
        if (answer.toLowerCase() === 'q' || answer === '') {
          rl.close();
          process.exit(0);
        }
        const index = Number(answer);
        target =
          TARGETS[index - 1] ?? TARGETS.find((t) => t.key === answer.toLowerCase()) ?? undefined;
        if (!target) console.log('  Not a valid choice.');
      }
    } finally {
      rl.close();
    }
  }

  console.log(`\n  → ${target.label}`);
  warnIfAndroidMissing(target);
  target.run();
}

await main();
