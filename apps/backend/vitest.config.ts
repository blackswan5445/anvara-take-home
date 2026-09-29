import { defineConfig } from 'vitest/config';

// Tests hit the real dev database, so they need the monorepo .env
process.loadEnvFile(new URL('../../.env', import.meta.url));

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    fileParallelism: false,
  },
});
