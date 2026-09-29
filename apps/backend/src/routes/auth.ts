import { Router, type IRouter, type Request, type Response } from 'express';
import { requireAuth } from '../auth.js';

const router: IRouter = Router();

// Sign-in/sign-out are handled by Better Auth in the Next.js app; the backend only verifies sessions.

// GET /api/auth/me - The signed-in user with their role and sponsor/publisher id
router.get('/me', requireAuth, (req: Request, res: Response) => {
  res.json(req.user);
});

export default router;
