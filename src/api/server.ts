import express, { Request, Response } from 'express';
import {
  getTeamAnalytics,
  getLeaderboard,
} from '../controllers/analytics.controller';
import { initRedis } from './redis';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.get('/api/teams/:teamId/analytics', getTeamAnalytics);
app.get('/api/teams/:teamId/leaderboard', getLeaderboard);

// Error handling
app.use((err: any, req: Request, res: Response, _next: any) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export async function setupRateLimiting() {
  // Try to initialize Redis for rate limiting; failure is non-fatal
  await initRedis();
}

export { app };
