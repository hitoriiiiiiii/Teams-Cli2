import axios from 'axios';
import { getAuthToken, readConfig } from '../config/auth.config';
import {
  createRepo,
  deleteRepoByFullName,
  getReposByTeam,
} from '../controllers/repo.controller';
import { db } from '../db/index';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

type User = {
  id: number;
  githubId: string;
  username: string;
  email?: string;
  activityStatus: string;
  createdAt: string | null;
};
const GITHUB_API = 'https://api.github.com';

/**
 * Connect a GitHub repository to active team
 */
export async function connectRepo({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
  isPrivate?: boolean;
}) {
  const token = getAuthToken();
  const config = readConfig();

  if (!config.activeTeamId) {
    throw new Error('No active team selected');
  }

  const res = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
    },
  });

  const data = res.data;

  return createRepo({
    githubId: data.id,
    name: data.name,
    fullName: data.full_name,
    private: data.private,
    stars: data.stargazers_count,
    forks: data.forks_count,
    teamId: config.activeTeamId,
  });
}

/**
 * List repos of active team
 */
export async function listRepos() {
  const config = readConfig();

  if (!config.activeTeamId) {
    throw new Error('No active team selected');
  }

  return getReposByTeam(config.activeTeamId);
}

/**
 * Disconnect repo from team
 */
export async function disconnectRepo(fullName: string) {
  const config = readConfig();

  if (!config.activeTeamId) {
    throw new Error('No active team selected');
  }

  return deleteRepoByFullName(config.activeTeamId, fullName);
}

/**
 * Fetch GitHub user metadata (repos, stars, forks, contributions)
 */
export async function getGithubUserMetadata(username: string) {
  const token = getAuthToken();

  try {
    // Fetch user profile
    const userRes = await axios.get(`${GITHUB_API}/users/${username}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    });

    const userData = userRes.data;

    // Fetch user repos with pagination
    const reposRes = await axios.get(`${GITHUB_API}/users/${username}/repos`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
      params: {
        per_page: 100,
        type: 'all',
        sort: 'updated',
      },
    });

    const repos = reposRes.data || [];

    // Calculate total stars and forks
    let totalStars = 0;
    let totalForks = 0;

    repos.forEach((repo: any) => {
      totalStars += repo.stargazers_count || 0;
      totalForks += repo.forks_count || 0;
    });

    // Fetch user contributions from GitHub GraphQL or use public repos count
    // For now, we'll use the public_repos count from user profile
    const publicRepos = userData.public_repos || 0;

    return {
      username: userData.login,
      name: userData.name || 'N/A',
      bio: userData.bio || 'N/A',
      company: userData.company || 'N/A',
      location: userData.location || 'N/A',
      publicRepos: publicRepos,
      followers: userData.followers || 0,
      following: userData.following || 0,
      totalStars,
      totalForks,
      totalRepos: repos.length,
      profileUrl: userData.html_url,
      createdAt: userData.created_at,
    };
  } catch (error: any) {
    throw new Error(
      `Failed to fetch GitHub metadata: ${error.message || error}`,
    );
  }
}

export async function getOrCreateUser(username: string): Promise<User> {
  const userResult = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  let user = userResult[0];

  if (!user) {
    const insertResult = await db
      .insert(users)
      .values({
        username,
        githubId: username,
        email: `${username}@github.local`,
      })
      .returning();
    user = insertResult[0];
  }

  return {
    ...user,
    email: user.email || undefined,
    activityStatus: user.activityStatus || 'ACTIVE',
  };
}
