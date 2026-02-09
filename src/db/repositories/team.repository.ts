import { eq, and } from 'drizzle-orm';
import { db } from '../index';
import { teams, teamMembers, users } from '../schema';

export type Team = typeof teams.$inferSelect;
export type TeamMember = typeof teamMembers.$inferSelect;

/**
 * Create a new team
 */
export async function createTeam(name: string): Promise<Team> {
  const result = await db.insert(teams).values({ name }).returning();
  return result[0];
}

/**
 * Get team by ID
 */
export async function getTeamById(teamId: number): Promise<Team | null> {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.id, teamId))
    .limit(1);
  return result[0] || null;
}

/**
 * Get all teams
 */
export async function getAllTeams(): Promise<Team[]> {
  return db.select().from(teams);
}

/**
 * Add user to team
 */
export async function addUserToTeam(
  userId: number,
  teamId: number,
): Promise<TeamMember> {
  // Check if user already exists in team
  const existingMember = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.userId, userId), eq(teamMembers.teamId, teamId)))
    .limit(1);

  if (existingMember.length > 0) {
    throw new Error('User is already a member of this team');
  }

  const result = await db
    .insert(teamMembers)
    .values({
      userId,
      teamId,
    })
    .returning();

  return result[0];
}

/**
 * Remove user from team
 */
export async function removeUserFromTeam(
  userId: number,
  teamId: number,
): Promise<void> {
  const member = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.userId, userId), eq(teamMembers.teamId, teamId)))
    .limit(1);

  if (member.length === 0) {
    throw new Error('User is not a member of this team');
  }

  await db
    .delete(teamMembers)
    .where(and(eq(teamMembers.userId, userId), eq(teamMembers.teamId, teamId)));
}

/**
 * Get team members with user details
 */
export async function getTeamMembers(teamId: number) {
  return db
    .select({
      teamMember: teamMembers,
      user: users,
    })
    .from(teamMembers)
    .where(eq(teamMembers.teamId, teamId))
    .leftJoin(users, eq(teamMembers.userId, users.id));
}

/**
 * Get teams for a user
 */
export async function getTeamsForUser(userId: number) {
  return db
    .select({
      team: teams,
      joinedAt: teamMembers.joinedAt,
    })
    .from(teamMembers)
    .where(eq(teamMembers.userId, userId))
    .leftJoin(teams, eq(teamMembers.teamId, teams.id));
}

/**
 * Check if user is member of team
 */
export async function isUserMemberOfTeam(
  userId: number,
  teamId: number,
): Promise<boolean> {
  const result = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.userId, userId), eq(teamMembers.teamId, teamId)))
    .limit(1);
  return result.length > 0;
}

/**
 * Delete team by ID
 */
export async function deleteTeam(teamId: number): Promise<Team | null> {
  const result = await db.delete(teams).where(eq(teams.id, teamId)).returning();
  return result[0] || null;
}

/**
 * Update team
 */
export async function updateTeam(
  teamId: number,
  updates: Partial<Omit<Team, 'id' | 'createdAt'>>,
): Promise<Team | null> {
  const result = await db
    .update(teams)
    .set(updates)
    .where(eq(teams.id, teamId))
    .returning();
  return result[0] || null;
}

/**
 * Count team members
 */
export async function getTeamMemberCount(teamId: number): Promise<number> {
  const result = await db
    .select()
    .from(teamMembers)
    .where(eq(teamMembers.teamId, teamId));
  return result.length;
}
