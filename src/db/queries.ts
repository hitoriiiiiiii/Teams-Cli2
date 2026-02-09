import { eq } from 'drizzle-orm';
import { db } from './index';
import { users, teams, teamMembers, invites } from './schema';

// Create a new user
export async function createUser(
  githubId: string,
  username: string,
  email?: string,
) {
  const result = await db
    .insert(users)
    .values({
      githubId,
      username,
      email,
    })
    .returning();
  return result[0];
}

// Create a new team
export async function createTeam(name: string) {
  const result = await db
    .insert(teams)
    .values({
      name,
    })
    .returning();
  return result[0];
}

// Add a member to a team
export async function addMemberToTeam(userId: number, teamId: number) {
  const result = await db
    .insert(teamMembers)
    .values({
      userId,
      teamId,
    })
    .returning();
  return result[0];
}

// Create an invite
export async function createInvite(
  code: string,
  teamId: number,
  invitedBy: number,
  invitedUser: string,
  expiresAt?: string,
) {
  const result = await db
    .insert(invites)
    .values({
      code,
      teamId,
      invitedBy,
      invitedUser,
      expiresAt,
    })
    .returning();
  return result[0];
}

// Get user by GitHub ID
export async function getUserByGithubId(githubId: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.githubId, githubId));
  return result[0];
}

// List teams for a user
export async function listTeamsForUser(userId: number) {
  const result = await db
    .select({
      teamId: teams.id,
      teamName: teams.name,
      joinedAt: teamMembers.joinedAt,
    })
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId))
    .innerJoin(teams, eq(teamMembers.teamId, teams.id));
  return result;
}
