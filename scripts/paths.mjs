/**
 * One place that knows the repo layout.
 *
 *   <repo>/
 *   ├── backend/            NestJS API
 *   ├── frontend/app/       Expo application (includes android/ and ios/)
 *   ├── frontend/web/       Vite app — landing page (/) and admin dashboard (/admin)
 *   └── scripts/            these launchers
 *
 * Every script imports from here so a future move means editing one file.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const APP_DIR = path.join(REPO_ROOT, 'frontend', 'app');
export const WEB_DIR = path.join(REPO_ROOT, 'frontend', 'web');
export const API_DIR = path.join(REPO_ROOT, 'backend');

export const WEB_HOST = 'localhost';
export const WEB_PORT = 5173;
export const WEB_URL = `http://${WEB_HOST}:${WEB_PORT}/login`;
export const API_URL = 'http://localhost:4000/api';

/**
 * Loads the repo-root `.env.local` into `process.env`.
 *
 * Expo only reads .env files sitting next to the app's package.json, which is
 * now `frontend/app/`. Keeping one env file at the repo root — shared by the
 * app, the web build and the launchers — means loading it here and passing it
 * down through the child environment. Existing variables always win, so a
 * value set in the shell still overrides the file.
 */
export function loadRootEnv() {
  const file = path.join(REPO_ROOT, '.env.local');
  if (!fs.existsSync(file)) return {};

  const loaded = {};
  for (const rawLine of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const eq = line.indexOf('=');
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    if (!key) continue;

    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    loaded[key] = value;
    if (process.env[key] === undefined) process.env[key] = value;
  }
  return loaded;
}
