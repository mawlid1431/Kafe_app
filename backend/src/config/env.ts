import { z } from 'zod';

/**
 * Environment contract. Validated once at boot — the process refuses to start
 * with a missing or malformed variable rather than failing on first request.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required (Neon pooled connection)'),
  DIRECT_URL: z.string().min(1, 'DIRECT_URL is required (Neon direct connection)'),

  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:8081'),

  CLERK_JWT_ISSUER: z.string().url('CLERK_JWT_ISSUER must be the Clerk instance URL'),
  CLERK_JWKS_URL: z.string().url('CLERK_JWKS_URL must be the Clerk JWKS endpoint'),
  CLERK_JWT_AUDIENCE: z.string().optional(),

  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  CLOUDINARY_FOLDER: z.string().default('kafe-eman'),

  ADMIN_SESSION_TTL_DAYS: z.coerce.number().int().positive().default(7),
  SEED_ADMIN_USERNAME: z.string().default('admin'),
  SEED_ADMIN_PASSWORD: z.string().optional(),

  /** Reserved for a planned AI feature. Nothing consumes it yet. */
  GROQ_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(raw);
  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${details}`);
  }
  return parsed.data;
}

export function corsOrigins(value: string): string[] {
  return value
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}
