import {
  createRepo as createRepoRepo,
  getReposByTeam as getReposByTeamRepo,
  deleteRepoByFullName as deleteRepoByFullNameRepo,
} from '../db/repositories/index.js';

export interface RepoData {
  githubId: string;
  name: string;
  fullName: string;
  private?: boolean;
  stars?: number;
  forks?: number;
  teamId: number;
  language?: string;
}

// Create a repository
export async function createRepo(data: RepoData) {
  return createRepoRepo(data);
}

// Get all repositories for a team
export async function getReposByTeam(teamId: number) {
  return getReposByTeamRepo(teamId);
}

// Delete a repository by fullName (CLI passes teamId, but repo deletion is by fullName)
export async function deleteRepoByFullName(teamId: number, fullName: string) {
  return deleteRepoByFullNameRepo(fullName);
}
