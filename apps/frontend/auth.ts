import { betterAuth } from 'better-auth';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL environment variable is required');

// No hardcoded fallback: a guessable secret would let anyone forge session cookies
const secret = process.env.BETTER_AUTH_SECRET;
if (!secret) throw new Error('BETTER_AUTH_SECRET environment variable is required');

// CSRF/origin checks stay on (the old config disabled them); sign-in is same-origin anyway.
export const auth = betterAuth({
  database: new Pool({ connectionString }),
  secret,
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3847',
  emailAndPassword: { enabled: true },
});
