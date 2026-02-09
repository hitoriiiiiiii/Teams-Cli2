import axios from 'axios';
import { eq } from 'drizzle-orm';

import { db as defaultDb } from '../db/index';
import { repos, commits as commitsTable } from '../db/schema';

export interface GitHubCommit {
  sha: string;
  message: string;
  author: string;
  date: string;
  files?: string[];
}

export async function getCommits(
  owner: string,
  repo: string,
  author?: string,
): Promise<GitHubCommit[]> {
  try {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits${
      author ? `?author=${author}` : ''
    }`;

    const response = await axios.get(url);

    return response.data.map((c: any) => ({
      sha: c.sha,
      message: c.commit.message,
      author: c.commit.author.name,
      date: c.commit.author.date,
      files: c.files?.map((f: any) => f.filename) || [],
    }));
  } catch (err: any) {
    console.error('Failed to fetch commits:', err.message);
    return [];
  }
}

export async function getCommit(
  owner: string,
  repo: string,
  sha: string,
  db = defaultDb,
) {
  try {
    const commitResult = await db
      .select()
      .from(commitsTable)
      .where(eq(commitsTable.sha, sha))
      .limit(1);

    const commit = commitResult[0];

    if (commit) {
      return { ...commit, source: 'db' };
    }

    const githubCommits = await getCommits(owner, repo);
    const ghCommit = githubCommits.find((c) => c.sha === sha);

    if (!ghCommit) return null;

    const repoResult = await db
      .select()
      .from(repos)
      .where(eq(repos.fullName, `${owner}/${repo}`))
      .limit(1);

    const repoRecord = repoResult[0];

    if (repoRecord) {
      try {
        await db.insert(commitsTable).values({
          sha: ghCommit.sha,
          message: ghCommit.message,
          repoId: repoRecord.id,
          createdAt: new Date(ghCommit.date).toISOString(),
        });
      } catch (dbErr: any) {
        if (!dbErr.message?.includes('UNIQUE constraint failed')) {
          console.warn('Could not save commit:', dbErr.message);
        }
      }
    }

    return { ...ghCommit, source: 'github' };
  } catch (err: any) {
    console.error('Failed to fetch commit:', err.message);
    return null;
  }
}
