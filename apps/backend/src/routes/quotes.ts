import { randomUUID } from 'node:crypto';
import { Router, type IRouter, type Request, type Response } from 'express';
import { z } from 'zod';
import { publicFormLimit } from '../rateLimit.js';
import { prisma } from '../db.js';
import { money, optionalText, parseOr400, requiredText } from '../validation.js';

const router: IRouter = Router();

const quoteRequestSchema = z.object({
  adSlotId: z.string().min(1, 'Ad slot is required'),
  companyName: requiredText('Company name', 120),
  email: z.email('Enter a valid email address').trim().toLowerCase().max(254),
  phone: optionalText(30),
  budget: money('Budget').nullish(),
  timeline: optionalText(100),
  message: requiredText('Message', 2000),
});

// POST /api/quotes/request - Dummy endpoint per the challenge: validate, don't persist.
// Open to signed-out visitors on purpose: quotes are a lead-capture path.
router.post('/request', publicFormLimit, async (req: Request, res: Response) => {
  const data = parseOr400(quoteRequestSchema, req.body, res);
  if (!data) return;

  const adSlotExists = await prisma.adSlot.count({ where: { id: data.adSlotId } });
  if (!adSlotExists) {
    res.status(404).json({ error: 'Ad slot not found' });
    return;
  }

  res.status(201).json({ success: true, quoteId: randomUUID() });
});

export default router;
