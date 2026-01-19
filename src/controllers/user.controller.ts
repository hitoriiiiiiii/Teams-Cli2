import prisma from '../db/prisma';

type GitHubUser = {
  githubId: string;
  username: string;
  email?: string;
};

/**
 * Create or update GitHub user
 */
export async function upsertGitHubUser(user: GitHubUser) {
  return prisma.user.upsert({
    where: { githubId: user.githubId },
    update: {
      username: user.username,
      email: user.email,
    },
    create: {
      githubId: user.githubId,
      username: user.username,
      email: user.email,
    },
  });
}

//get user by username 
export async function getUserByUsername(username: string) {
  return prisma.user.findFirst({
    where: { username },
  });
}
