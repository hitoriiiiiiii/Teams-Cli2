import prisma from '../db/prisma';

export async function createRepo(data: {
  githubId: number;
  name: string;
  fullName: string;
  private: boolean;
  stars: number;
  forks: number;
  teamId: number;
}) {
  return prisma.repo.create({
    data,
  });
}

export async function getReposByTeam(teamId: number) {
  return prisma.repo.findMany({
    where: { teamId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function deleteRepoByFullName(
  teamId: number,
  fullName: string,
) {
  return prisma.repo.delete({
    where: {
      teamId_fullName: {
        teamId: teamId,     // ✅ use function param
        fullName: fullName // ✅ use function param
      },
    },
  });
}
