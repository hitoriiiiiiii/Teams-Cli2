import axios from 'axios';
import { getAuthToken, readConfig } from '../config/auth.config';
import {
  createRepo,
  deleteRepoByFullName,
  getReposByTeam,
} from '../controllers/repo.controller';

const GITHUB_API = 'https://api.github.com';

/**
 * Connect a GitHub repository to active team
 */
export async function connectRepo({
  owner,
  repo,
  isPrivate,
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
