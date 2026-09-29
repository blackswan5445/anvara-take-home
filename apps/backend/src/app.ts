import cors from 'cors';
import express, { type Application, type ErrorRequestHandler } from 'express';
import { Prisma } from './db.js';
import { apiLimit } from './rateLimit.js';
import routes from './routes/index.js';

const app: Application = express();

// The Next.js server calls this API for its users and forwards their IP in X-Forwarded-For.
// Trust that header only from loopback, so direct callers can't spoof it to dodge rate limits.
// ponytail: assumes Next and the API share a host, and that the edge in front of Next sets
// X-Forwarded-For; otherwise trust the Next server's address instead of 'loopback'.
app.set('trust proxy', 'loopback');

// The browser never calls this API directly (Next.js server components and actions do),
// so only the frontend origin is allowed, with cookies.
app.use(
  cors({ origin: process.env.BETTER_AUTH_URL || 'http://localhost:3847', credentials: true })
);
app.use(express.json({ limit: '100kb' }));

app.use('/api', apiLimit, routes);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Express 5 forwards rejected promises from async handlers here, so routes don't need try/catch.
const errorHandler: ErrorRequestHandler = (err: unknown, req, res, _next) => {
  // body-parser errors (malformed JSON, payload too large) carry a safe 4xx status
  if (isClientError(err)) {
    res.status(err.status).json({ error: err.expose ? err.message : 'Bad request' });
    return;
  }
  // Record vanished between the ownership check and the query (e.g. a concurrent delete)
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  console.error(`${req.method} ${req.originalUrl} failed:`, err);
  res.status(500).json({ error: 'Internal server error' });
};
app.use(errorHandler);

function isClientError(err: unknown): err is { status: number; expose?: boolean; message: string } {
  if (typeof err !== 'object' || err === null || !('status' in err)) return false;
  return typeof err.status === 'number' && err.status >= 400 && err.status < 500;
}

export default app;
