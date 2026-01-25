import express, { Request, Response } from 'express';
import { initRedis, closeRedis } from './redis';
import {
  createRateLimiter,
  rateLimitByUser,
  strictRateLimit,
} from './rateLimiter';

const app = express();

// Middleware
app.use(express.json());

// Initialize Redis for rate limiting
async function setupRateLimiting() {
  await initRedis();

  // Global rate limiter (applies to all routes)
  app.use(
    createRateLimiter({
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100, // 100 requests per minute
    }),
  );

  console.log('✅ Rate limiting initialized');
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes with different rate limits

// Public routes (generous limit)
app.get('/api/public/teams', (req: Request, res: Response) => {
  res.json({ message: 'List of public teams' });
});

// User routes (medium limit)
app.post(
  '/api/teams',
  rateLimitByUser({ maxRequests: 20 }),
  (req: Request, res: Response) => {
    res.json({ message: 'Team created', id: 1 });
  },
);

app.get('/api/teams', rateLimitByUser(), (req: Request, res: Response) => {
  res.json({ teams: [] });
});

// Authentication routes (strict limit)
app.post(
  '/api/auth/login',
  strictRateLimit(),
  (req: Request, res: Response) => {
    res.json({ message: 'Login successful', token: 'xyz' });
  },
);

app.post(
  '/api/auth/register',
  strictRateLimit(),
  (req: Request, res: Response) => {
    res.json({ message: 'Registration successful', userId: 1 });
  },
);

// Repository routes
app.post(
  '/api/repos',
  rateLimitByUser({ maxRequests: 30 }),
  (req: Request, res: Response) => {
    res.json({ message: 'Repository created', id: 1 });
  },
);

app.get('/api/repos', rateLimitByUser(), (req: Request, res: Response) => {
  res.json({ repos: [] });
});

// Error handling
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await closeRedis();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await closeRedis();
  process.exit(0);
});

export { app, setupRateLimiting };
