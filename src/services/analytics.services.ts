import { db } from '../db/index.js';
import { users, teamMembers, commits, repos } from '../db/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';

export async function computeMemberActivity(teamId: number) {
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

  for (const member of members) {
    if (!member.user) continue;
    const lastCommitResult = await db
      .select()
      .from(commits)
      .leftJoin(repos, eq(commits.repoId, repos.id))
      .where(
        and(eq(commits.author, member.user.githubId), eq(repos.teamId, teamId)),
      )
      .orderBy(desc(commits.createdAt))
      .limit(1);
    const lastCommit = lastCommitResult[0]?.commits;

    let status = 'INACTIVE';

    if (lastCommit && lastCommit.createdAt) {
      const daysAgo =
        (Date.now() - new Date(lastCommit.createdAt).getTime()) /
        (1000 * 60 * 60 * 24);

      if (daysAgo <= 7) status = 'ACTIVE_7_DAYS';
      else if (daysAgo <= 14) status = 'ACTIVE_14_DAYS';
      else if (daysAgo <= 30) status = 'ACTIVE_30_DAYS';
    }

    await db
      .update(users)
      .set({
        activityStatus: status as any,
      })
      .where(eq(users.id, member.userId));
  }
}

export async function getTeamLeaderboard(teamId: number) {
  const leaderboard = await db
    .select({
      author: commits.author,
      count: sql<number>`count(${commits.id})`,
    })
    .from(commits)
    .leftJoin(repos, eq(commits.repoId, repos.id))
    .where(and(eq(repos.teamId, teamId), sql`${commits.author} IS NOT NULL`))
    .groupBy(commits.author)
    .orderBy(desc(sql<number>`count(${commits.id})`));

  return leaderboard.map((item) => ({
    authorId: item.author,
    _count: { id: item.count },
  }));
}
