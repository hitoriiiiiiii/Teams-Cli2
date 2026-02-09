import express, { Request, Response } from 'express';
import {
  getTeamAnalytics,
  getLeaderboard,
} from '../controllers/analytics.controller';

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

export { app };
