import {
  upsertGitHubUser as upsertUser,
  getUserByUsername as getUser,
} from '../db/repositories';

type GitHubUser = {
  githubId: string;
  username: string;
  email?: string;
};

/**
 * Create or update GitHub user
 */
export async function upsertGitHubUser(user: GitHubUser) {
  return upsertUser(user);
}

/**
 * Get user by username
 */
export async function getUserByUsername(username: string) {
  return getUser(username);
}
