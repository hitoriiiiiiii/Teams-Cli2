import prisma from '../db/prisma';

describe('Commit Module (Prisma Integration Tests)', () => {
  let userId: number;
  let teamId: number;
  let repoId: number;
  let commitId1: number | undefined;
  let commitId2: number | undefined;

  beforeAll(async () => {
    // Clean DB in FK-safe order
    await prisma.commit.deleteMany();
    await prisma.repo.deleteMany();
    await prisma.teamMember.deleteMany();
    await prisma.team.deleteMany();
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
      data: {
        githubId: 'commit_user_001',
        username: 'COMMIT_USER',
        email: 'commituser@test.com',
      },
    });
    userId = user.id;

    const team = await prisma.team.create({
      data: { name: 'Commit Team' },
    });
    teamId = team.id;

    await prisma.teamMember.create({
      data: { userId, teamId },
    });

    const repo = await prisma.repo.create({
      data: {
        name: 'Commit Repo',
        fullName: 'Commit Team/Commit Repo',
        githubId: 5555,
        teamId,
        stars: 5,
        forks: 1,
        private: false,
        language: 'TypeScript',
      },
    });
    repoId = repo.id;
  });

  it('should create multiple commits for repo', async () => {
    const commit1 = await prisma.commit.create({
      data: {
        message: 'Initial commit',
        sha: 'sha123',
        repoId,
      },
    });

    const commit2 = await prisma.commit.create({
      data: {
        message: 'Added README',
        sha: 'sha456',
        repoId,
      },
    });

    commitId1 = commit1.id;
    commitId2 = commit2.id;

    expect(commit1.repoId).toBe(repoId);
    expect(commit2.repoId).toBe(repoId);
  });

  it('should fetch all commits of a repo', async () => {
    const commits = await prisma.commit.findMany({
      where: { repoId },
      orderBy: { id: 'asc' },
    });

    expect(commits.length).toBe(2);
    expect(commits[0].message).toBe('Initial commit');
    expect(commits[1].message).toBe('Added README');
  });

  it('should not allow duplicate SHA', async () => {
    await expect(
      prisma.commit.create({
        data: {
          message: 'Duplicate SHA commit',
          sha: 'sha123',
          repoId,
        },
      }),
    ).rejects.toThrow();
  });

  it('should delete commits', async () => {
    if (commitId1 && commitId2) {
      await prisma.commit.deleteMany({
        where: { id: { in: [commitId1, commitId2] } },
      });

      const commits = await prisma.commit.findMany({ where: { repoId } });
      expect(commits.length).toBe(0);
    }
  });
});
