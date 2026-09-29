import { createAuthClient } from 'better-auth/react';

// Same-origin: Better Auth's routes live at /api/auth on this Next.js app
export const authClient = createAuthClient();
