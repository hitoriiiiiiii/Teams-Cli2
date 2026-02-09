import { db } from '../db/index';
import { commits } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Create or update commit
 */
export async function upsertCommit(
  repoId: number,
  sha: string,
  message: string,
) {
  const existing = await db
    .select()
    .from(commits)
    .where(eq(commits.sha, sha))
    .limit(1);
  if (existing.length > 0) {
    return existing[0];
  }
  const result = await db
    .insert(commits)
    .values({
      sha,
      message,
      repoId,
    })
    .returning();
  return result[0];
}

// Get commits by repo
export async function getCommitsByRepo(repoId: number) {
  return db.select().from(commits).where(eq(commits.repoId, repoId));
}
