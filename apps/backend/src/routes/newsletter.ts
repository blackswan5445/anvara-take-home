import { Router, type IRouter, type Request, type Response } from 'express';
import { z } from 'zod';
import { publicFormLimit } from '../rateLimit.js';
import { parseOr400 } from '../validation.js';

const router: IRouter = Router();

const subscribeSchema = z.object({
  email: z.email('Enter a valid email address').trim().toLowerCase().max(254),
});

// POST /api/newsletter/subscribe - Dummy endpoint per the challenge: validate, don't persist
router.post('/subscribe', publicFormLimit, (req: Request, res: Response) => {
  const data = parseOr400(subscribeSchema, req.body, res);
  if (!data) return;

  res.json({ success: true, message: 'Thanks for subscribing!' });
});

export default router;
