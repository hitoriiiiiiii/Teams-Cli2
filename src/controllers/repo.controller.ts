import prisma from '../db/prisma';

export interface RepoData {
  githubId: number;
  name: string;
  fullName: string;
  private: boolean;
  stars: number;
  forks: number;
  teamId: number;
}

// Create a repository
export async function createRepo(data: RepoData) {
  return prisma.repo.create({ data });
}

// Get all repositories for a team
export async function getReposByTeam(teamId: number) {
  return prisma.repo.findMany({
    where: { teamId },
    orderBy: { createdAt: 'desc' },
  });
}

// Delete a repository by fullName
export async function deleteRepoByFullName(teamId: number, fullName: string) {
  return prisma.repo.delete({
    where: {
      fullName,
    },
  });
}
