import {
  createTeam as createTeamRepo,
  addUserToTeam,
  removeUserFromTeam as removeUserRepo,
  getTeamMembers as getTeamMembersRepo,
  getTeamById as getTeamByIdRepo,
  getTeamsForUser,
} from '../db/repositories/index.js';
import { getUserById } from '../db/repositories/index.js';

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

export async function getTeamByName(_name: string) {
  // This would need to be added to the repository if used frequently
  // For now, we'll keep it simple - teams are typically accessed by ID
  throw new Error('getTeamByName should be refactored to use repository');
}

export async function listTeams(userId: number) {
  return getTeamsForUser(userId);
}
