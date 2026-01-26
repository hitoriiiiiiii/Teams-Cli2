import prisma from '../db/prisma';

describe('Commit Module (Prisma Integration Tests)', () => {
  let userId: number;
  let teamId: number;
  let repoId: number;
  let commitId1: number | undefined;
  let commitId2: number | undefined;

  beforeAll(async () => {
    // Create fresh test data with unique names to avoid conflicts
    const testTimestamp = Date.now();

    const newUser = await prisma.user.create({
      data: {
        githubId: 'commit_user_' + testTimestamp,
        username: 'COMMIT_USER_' + testTimestamp,
        email: `commituser_${testTimestamp}@test.com`,
      },
    });
    userId = newUser.id;

    const team = await prisma.team.create({
      data: { name: 'Commit Team ' + testTimestamp },
    });
    teamId = team.id;

    await prisma.teamMember.create({
      data: { userId, teamId },
    });

    const repo = await prisma.repo.create({
      data: {
        name: 'Commit Repo',
        fullName: 'Commit Team/Commit Repo ' + testTimestamp,
        githubId: Math.floor(5555 + Math.random() * 10000),
        teamId,
        stars: 5,
        forks: 1,
        private: false,
        language: 'TypeScript',
      },
    });
    repoId = repo.id;
  });

  afterAll(async () => {
    // Attempt cleanup (best effort, ignore errors to avoid interfering with other tests)
    try {
      await prisma.commit.deleteMany({ where: { repoId } });
      await prisma.repo.deleteMany({ where: { id: repoId } });
      await prisma.teamMember.deleteMany({ where: { teamId } });
      await prisma.team.deleteMany({ where: { id: teamId } });
      await prisma.user.deleteMany({ where: { id: userId } });
    } catch (error) {
      // Silently ignore cleanup errors
    }

    await prisma.$disconnect();
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
