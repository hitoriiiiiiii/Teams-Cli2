import express, { Request, Response } from 'express';
import { initRedis, closeRedis } from './redis';
import {
  createRateLimiter,
  rateLimitByUser,
  strictRateLimit,
  checkInviteRateLimit,
  getInviteRateLimitRemaining,
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

// Invitation routes with rate limiting
app.post(
  '/api/invites/send',
  async (req: Request, res: Response) => {
    try {
      const { userId, teamId } = req.body;

      // Check invitation rate limit (max 10 per hour per team)
      const withinLimit = await checkInviteRateLimit(userId, teamId);
      if (!withinLimit) {
        const remaining = await getInviteRateLimitRemaining(userId, teamId);
        return res.status(429).json({
          error: 'Invitation rate limit exceeded',
          message: `You can send max 10 invites per hour per team. Remaining: ${remaining}`,
          retryAfter: 3600,
        });
      }

      res.json({ message: 'Invitation sent', code: 'ABC12345' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

app.get(
  '/api/invites/check-limit',
  async (req: Request, res: Response) => {
    try {
      const { userId, teamId } = req.query;

      const remaining = await getInviteRateLimitRemaining(
        parseInt(userId as string),
        parseInt(teamId as string)
      );

      res.json({
        maxInvitesPerHour: 10,
        remaining,
        status: remaining > 0 ? 'OK' : 'LIMIT_EXCEEDED',
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
);

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
