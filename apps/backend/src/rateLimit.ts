import { rateLimit } from 'express-rate-limit';

const tooMany = { error: 'Too many requests. Please wait a moment and try again.' };

// Generous per-client ceiling for the whole API
export const apiLimit = rateLimit({
  windowMs: 60_000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: tooMany,
});

// Public, unauthenticated writes (newsletter, quotes): the spam targets
export const publicFormLimit = rateLimit({
  windowMs: 10 * 60_000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: tooMany,
});
