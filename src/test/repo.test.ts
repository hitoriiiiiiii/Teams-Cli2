import prisma from '../db/prisma';

describe('Repo Module (Prisma Integration Tests)', () => {
  let userId: number;
  let teamId: number;
  let repoId: number;

  beforeAll(async () => {
    // Clean DB in FK-safe order
    await prisma.commit.deleteMany();
    await prisma.repo.deleteMany();
    await prisma.teamMember.deleteMany();
    await prisma.team.deleteMany();
    await prisma.user.deleteMany();

    // Create a test user
    const user = await prisma.user.create({
      data: {
        githubId: 'repo_user_001',
        username: 'REPO_USER',
        email: 'repouser@test.com',
      },
    });
    userId = user.id;

    // Create a test team
    const team = await prisma.team.create({
      data: {
        name: 'Repo Team',
      },
    });
    teamId = team.id;

    // Add user to team
    await prisma.teamMember.create({
      data: {
        userId,
        teamId,
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // CREATE REPO

  it('should create a repo under a team', async () => {
    const repo = await prisma.repo.create({
      data: {
        name: 'Awesome Repo',
        fullName: 'Repo Team/Awesome Repo',
        githubId: 12345,
        teamId,
        stars: 10,
        forks: 2,
        language: 'TypeScript',
        private: false,
      },
    });

    repoId = repo.id;

    expect(repo).toBeDefined();
    expect(repo.name).toBe('Awesome Repo');
    expect(repo.teamId).toBe(teamId);
    expect(repo.fullName).toBe('Repo Team/Awesome Repo');
  });

  // FETCH REPO WITH TEAM

  it('should fetch repo with its team', async () => {
    const repo = await prisma.repo.findUnique({
      where: { id: repoId },
      include: { team: true },
    });

    expect(repo).not.toBeNull();
    expect(repo?.team.name).toBe('Repo Team');
  });

  // CREATE COMMITS FOR REPO

  it('should create commits for repo', async () => {
    const commit1 = await prisma.commit.create({
      data: {
        message: 'Initial commit',
        sha: 'abc123',
        repoId,
      },
    });

    const commit2 = await prisma.commit.create({
      data: {
        message: 'Added README',
        sha: 'def456',
        repoId,
      },
    });

    expect(commit1.repoId).toBe(repoId);
    expect(commit2.repoId).toBe(repoId);
  });

  // FETCH REPO WITH COMMITS

  it('should fetch repo including commits', async () => {
    const repo = await prisma.repo.findUnique({
      where: { id: repoId },
      include: { commits: true },
    });

    expect(repo).not.toBeNull();
    expect(repo?.commits.length).toBe(2);
    expect(repo?.commits[0].message).toBe('Initial commit');
    expect(repo?.commits[1].message).toBe('Added README');
  });

  // TEST UNIQUE CONSTRAINTS

  it('should not allow duplicate fullName', async () => {
    // Create first repo
    const repo1 = await prisma.repo.create({
      data: {
        name: 'Awesome Repo',
        fullName: 'Repo Team/Awesome Repo Unique',
        githubId: 77777,
        teamId,
        stars: 0,
        forks: 0,
        private: false,
      },
    });

    // Try to create duplicate fullName
    await expect(
      prisma.repo.create({
        data: {
          name: 'Awesome Repo Duplicate',
          fullName: 'Repo Team/Awesome Repo Unique', // same fullName
          githubId: 99999,
          teamId,
          stars: 0,
          forks: 0,
          private: false,
        },
      }),
    ).rejects.toThrow(); // P2002 Unique constraint violation
  });

  it('should not allow duplicate githubId', async () => {
    // Create first repo
    const repo1 = await prisma.repo.create({
      data: {
        name: 'Another Repo',
        fullName: 'Repo Team/Another Repo Unique',
        githubId: 88888,
        teamId,
        stars: 0,
        forks: 0,
        private: false,
      },
    });

    // Try to create duplicate githubId
    await expect(
      prisma.repo.create({
        data: {
          name: 'Another Repo Duplicate',
          fullName: 'Repo Team/Another Repo Different',
          githubId: 88888, // duplicate githubId
          teamId,
          stars: 0,
          forks: 0,
          private: false,
        },
      }),
    ).rejects.toThrow(); // P2002 Unique constraint violation
  });

  // DELETE REPO AND COMMITS

  it('should delete repo and its commits', async () => {
    // Create a fresh repo for deletion
    const deleteRepo = await prisma.repo.create({
      data: {
        name: 'Repo to Delete',
        fullName: 'Repo Team/Repo to Delete',
        githubId: 66666,
        teamId,
        stars: 0,
        forks: 0,
        private: false,
      },
    });
    const deleteRepoId = deleteRepo.id;

    // Create commits for deletion
    await prisma.commit.create({
      data: {
        message: 'Commit 1',
        sha: 'commit_sha_001',
        repoId: deleteRepoId,
      },
    });

    // Delete commits first, then repo
    await prisma.commit.deleteMany({ where: { repoId: deleteRepoId } });
    await prisma.repo.delete({ where: { id: deleteRepoId } });

    const repo = await prisma.repo.findUnique({ where: { id: deleteRepoId } });
    const commits = await prisma.commit.findMany({ where: { repoId: deleteRepoId } });

    expect(repo).toBeNull();
    expect(commits.length).toBe(0);
  });
});
