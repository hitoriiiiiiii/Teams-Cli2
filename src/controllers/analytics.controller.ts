import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { teamMembers, users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { getTeamLeaderboard } from '../services/analytics.services.js';

export async function getTeamAnalytics(req: Request, res: Response) {
  const teamId = Number(req.params.teamId);

  const members = await db
    .select({
      id: teamMembers.id,
      userId: teamMembers.userId,
      teamId: teamMembers.teamId,
      joinedAt: teamMembers.joinedAt,
      user: {
        id: users.id,
        githubId: users.githubId,
        username: users.username,
        email: users.email,
        activityStatus: users.activityStatus,
        createdAt: users.createdAt,
      },
    })
    .from(teamMembers)
    .leftJoin(users, eq(teamMembers.userId, users.id))
    .where(eq(teamMembers.teamId, teamId));

  res.json(members);
}

export async function getLeaderboard(req: Request, res: Response) {
  const teamId = Number(req.params.teamId);
  const leaderboard = await getTeamLeaderboard(teamId);
  res.json(leaderboard);
}
