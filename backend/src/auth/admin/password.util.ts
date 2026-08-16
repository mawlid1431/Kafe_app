import { createHash, pbkdf2, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const pbkdf2Async = promisify(pbkdf2);

/**
 * Admin password hashing: PBKDF2-SHA256, 120k iterations, 256-bit key,
 * 16-byte random salt, hex encoded. Verification is constant-time.
 */
const PBKDF2_ITERATIONS = 120_000;
const KEY_BYTES = 32; // 256 bits
const SALT_BYTES = 16;

export async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = randomBytes(SALT_BYTES);
  const derived = await pbkdf2Async(password, salt, PBKDF2_ITERATIONS, KEY_BYTES, 'sha256');
  return { hash: derived.toString('hex'), salt: salt.toString('hex') };
}

export async function verifyPassword(
  password: string,
  storedHash: string,
  storedSalt: string,
): Promise<boolean> {
  try {
    const salt = Buffer.from(storedSalt, 'hex');
    const expected = Buffer.from(storedHash, 'hex');
    const actual = await pbkdf2Async(password, salt, PBKDF2_ITERATIONS, KEY_BYTES, 'sha256');
    if (actual.length !== expected.length) return false;
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/** Opaque 32-byte session token, returned to the client exactly once. */
export function generateSecureToken(): string {
  return randomBytes(32).toString('hex');
}

/** Only the hash is ever persisted, so a database leak yields no usable tokens. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}
