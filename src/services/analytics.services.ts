import prisma from '../db/prisma';

export async function computeMemberActivity(teamId: number) {
  const members = await prisma.teamMember.findMany({
    where: { teamId },
    include: { user: true },
  });

  for (const member of members) {
    const lastCommit = await prisma.commit.findFirst({
      where: {
        authorId: member.userId,
        repo: { teamId },
      },
      orderBy: { createdAt: 'desc' },
    });

    let status = 'INACTIVE';
    let lastActiveAt = lastCommit?.createdAt || null;

    if (lastCommit) {
      const daysAgo =
        (Date.now() - lastCommit.createdAt.getTime()) / (1000 * 60 * 60 * 24);

      if (daysAgo <= 7) status = 'ACTIVE_7_DAYS';
      else if (daysAgo <= 14) status = 'ACTIVE_14_DAYS';
      else if (daysAgo <= 30) status = 'ACTIVE_30_DAYS';
    }

    await prisma.teamMember.update({
      where: { id: member.id },
      data: { lastActiveAt, activityStatus: status as any },
    });
  }
}

export async function getTeamLeaderboard(teamId: number) {
  return prisma.commit.groupBy({
    by: ['authorId'],
    where: {
      repo: { teamId },
      authorId: { not: null },
    },
    _count: { id: true },
    orderBy: {
      _count: { id: 'desc' },
    },
  });
}
