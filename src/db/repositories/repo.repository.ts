import { eq } from 'drizzle-orm';
import { db } from '../index.js';
import { repos } from '../schema.js';

export type Repo = typeof repos.$inferSelect;

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

/**
 * Create a repository
 */
export async function createRepo(data: RepoData): Promise<Repo> {
  const result = await db
    .insert(repos)
    .values({
      githubId: data.githubId,
      name: data.name,
      fullName: data.fullName,
      teamId: data.teamId,
    })
    .returning();
  return result[0];
}

/**
 * Get repository by ID
 */
export async function getRepoById(repoId: number): Promise<Repo | null> {
  const result = await db
    .select()
    .from(repos)
    .where(eq(repos.id, repoId))
    .limit(1);
  return result[0] || null;
}

/**
 * Get repository by full name
 */
export async function getRepoByFullName(
  fullName: string,
): Promise<Repo | null> {
  const result = await db
    .select()
    .from(repos)
    .where(eq(repos.fullName, fullName))
    .limit(1);
  return result[0] || null;
}

/**
 * Get all repositories for a team
 */
export async function getReposByTeam(teamId: number): Promise<Repo[]> {
  return db.select().from(repos).where(eq(repos.teamId, teamId));
}

/**
 * Update repository
 */
export async function updateRepo(
  repoId: number,
  updates: Partial<Omit<Repo, 'id' | 'createdAt'>>,
): Promise<Repo | null> {
  const result = await db
    .update(repos)
    .set(updates)
    .where(eq(repos.id, repoId))
    .returning();
  return result[0] || null;
}

/**
 * Delete repository by ID
 */
export async function deleteRepoById(repoId: number): Promise<Repo | null> {
  const result = await db.delete(repos).where(eq(repos.id, repoId)).returning();
  return result[0] || null;
}

/**
 * Delete repository by full name
 */
export async function deleteRepoByFullName(
  fullName: string,
): Promise<Repo | null> {
  const result = await db
    .delete(repos)
    .where(eq(repos.fullName, fullName))
    .returning();
  return result[0] || null;
}

/**
 * Check if repository exists by GitHub ID
 */
export async function repoExists(githubId: string): Promise<boolean> {
  const result = await db
    .select()
    .from(repos)
    .where(eq(repos.githubId, githubId))
    .limit(1);
  return result.length > 0;
}

/**
 * Get all repositories for a team with pagination
 */
export async function getReposByTeamPaginated(
  teamId: number,
  limit: number = 10,
  offset: number = 0,
): Promise<{ repos: Repo[]; total: number }> {
  const allRepos = await db
    .select()
    .from(repos)
    .where(eq(repos.teamId, teamId));
  const paginatedRepos = allRepos.slice(offset, offset + limit);
  return {
    repos: paginatedRepos,
    total: allRepos.length,
  };
}
