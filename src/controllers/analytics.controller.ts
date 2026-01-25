import { Request, Response } from 'express';
import prisma from '../db/prisma';
import { getTeamLeaderboard } from '../services/analytics.services';

export async function getTeamAnalytics(req: Request, res: Response) {
  const teamId = Number(req.params.teamId);

  const members = await prisma.teamMember.findMany({
    where: { teamId },
    include: { user: true },
  });

  res.json(members);
}

export async function getLeaderboard(req: Request, res: Response) {
  const teamId = Number(req.params.teamId);
  const leaderboard = await getTeamLeaderboard(teamId);
  res.json(leaderboard);
}
