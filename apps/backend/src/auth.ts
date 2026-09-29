import { betterAuth } from 'better-auth';
import { fromNodeHeaders } from 'better-auth/node';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { Pool } from 'pg';
import { prisma } from './db.js';

const secret = process.env.BETTER_AUTH_SECRET;
if (!secret) throw new Error('BETTER_AUTH_SECRET environment variable is required');

// Same database and secret as the frontend's Better Auth instance, so the session
// cookie it issues can be verified here. The backend never signs anyone in itself.
export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  secret,
  baseURL: process.env.BETTER_AUTH_URL,
  emailAndPassword: { enabled: true },
});

export type Role = 'sponsor' | 'publisher';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role | null;
  sponsorId: string | null;
  publisherId: string | null;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace -- Express's documented extension point
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

/** 401 unless the request carries a valid Better Auth session; attaches req.user. */
export const requireAuth: RequestHandler = async (req, res, next) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  const { id, email, name } = session.user;
  const [sponsor, publisher] = await Promise.all([
    prisma.sponsor.findUnique({ where: { userId: id }, select: { id: true } }),
    prisma.publisher.findUnique({ where: { userId: id }, select: { id: true } }),
  ]);

  req.user = {
    id,
    email,
    name,
    role: sponsor ? 'sponsor' : publisher ? 'publisher' : null,
    sponsorId: sponsor?.id ?? null,
    publisherId: publisher?.id ?? null,
  };
  next();
};

/** 403 unless the authenticated user has the given role. Use after requireAuth. */
export function requireRole(role: Role): RequestHandler {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      res.status(403).json({ error: `Only ${role}s can access this resource` });
      return;
    }
    next();
  };
}

/** The caller's sponsor/publisher id. Only valid on routes guarded by requireRole(role). */
export function roleIdOf(req: Request, role: Role): string {
  const id = role === 'sponsor' ? req.user?.sponsorId : req.user?.publisherId;
  if (!id) throw new Error(`roleIdOf('${role}') used on a route without requireRole('${role}')`);
  return id;
}

/**
 * 404 if the :id resource doesn't exist, 403 if it belongs to someone else.
 * `getOwnerId` returns the resource's sponsorId/publisherId, or undefined if not found.
 */
export function requireOwnership(
  resource: string,
  role: Role,
  getOwnerId: (id: string) => Promise<string | undefined>
) {
  return async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    const ownerId = await getOwnerId(req.params.id);
    if (!ownerId) {
      res.status(404).json({ error: `${resource} not found` });
      return;
    }
    if (ownerId !== roleIdOf(req, role)) {
      res.status(403).json({ error: `You don't have access to this ${resource.toLowerCase()}` });
      return;
    }
    next();
  };
}
