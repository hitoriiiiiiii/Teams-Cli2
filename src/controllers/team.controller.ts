import {
  createTeam as createTeamRepo,
  addUserToTeam,
  removeUserFromTeam as removeUserRepo,
  getTeamMembers as getTeamMembersRepo,
  getTeamById as getTeamByIdRepo,
  getTeamsForUser,
} from '../db/repositories';
import { getUserById } from '../db/repositories';

//Create a team and add owner as member
export async function createTeam(teamName: string, ownerUserId: number) {
  // First, ensure the user exists in the database
  const user = await getUserById(ownerUserId);
  if (!user) {
    throw new Error(`User with ID ${ownerUserId} does not exist`);
  }

  // Create the team
  const team = await createTeamRepo(teamName);

  // Add owner as a member
  await addUserToTeam(ownerUserId, team.id);

  return team;
}

//add users to team
export async function addUsertoTeam(userId: number, teamId: number) {
  return addUserToTeam(userId, teamId);
}

/**
 * Remove a user from a team
 */
export async function removeUserFromTeam(userId: number, teamId: number) {
  return removeUserRepo(userId, teamId);
}

/**
 * Get team members
 */
export async function getTeamMembers(teamId: number) {
  return getTeamMembersRepo(teamId);
}

/**
 * Get team by ID
 */
export async function getTeamById(teamId: number) {
  const team = await getTeamByIdRepo(teamId);
  if (!team) return null;
  const members = await getTeamMembersRepo(teamId);
  return { ...team, members };
}

//Get team of a user
export async function getTeamByUser(userId: number) {
  return getTeamsForUser(userId);
}

export async function getTeamByName(name: string) {
  const db = (await import('../db/index')).db;
  const { teams } = await import('../db/schema');
  const { eq } = await import('drizzle-orm');

  const teamResult = await db
    .select()
    .from(teams)
    .where(eq(teams.name, name))
    .limit(1);

  return teamResult[0] || null;
}

export async function listTeams(userId: number) {
  return getTeamsForUser(userId);
}
