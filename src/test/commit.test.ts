import prisma from "../db/prisma";

describe("Commit Module (Prisma Integration Tests)", () => {
  let userId: number;
  let teamId: number;
  let repoId: number;
  let commitId1: number;
  let commitId2: number;

  beforeAll(async () => {
    // Clean DB in FK-safe order
    await prisma.commit.deleteMany();
    await prisma.repo.deleteMany();
    await prisma.teamMember.deleteMany();
    await prisma.team.deleteMany();
    await prisma.user.deleteMany();

    // Create test user
    const user = await prisma.user.create({
      data: {
        githubId: "commit_user_001",
        username: "COMMIT_USER",
        email: "commituser@test.com",
      },
    });
    userId = user.id;

    // Create test team
    const team = await prisma.team.create({
      data: {
        name: "Commit Team",
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

    // Create repo
    const repo = await prisma.repo.create({
      data: {
        name: "Commit Repo",
        fullName: "Commit Team/Commit Repo",
        githubId: 5555,
        teamId,
        stars: 5,
        forks: 1,
        private: false,
        language: "TypeScript",
      },
    });
    repoId = repo.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // CREATE COMMITS
  it("should create multiple commits for repo", async () => {
    const commit1 = await prisma.commit.create({
      data: {
        message: "Initial commit",
        sha: "sha123",
        repoId,
      },
    });
    const commit2 = await prisma.commit.create({
      data: {
        message: "Added README",
        sha: "sha456",
        repoId,
      },
    });

    commitId1 = commit1.id;
    commitId2 = commit2.id;

    expect(commit1.repoId).toBe(repoId);
    expect(commit2.repoId).toBe(repoId);
  });

  // FETCH COMMITS BY REPO
  it("should fetch all commits of a repo", async () => {
    const commits = await prisma.commit.findMany({
      where: { repoId },
    });

    expect(commits.length).toBe(2);
    expect(commits[0].message).toBe("Initial commit");
    expect(commits[1].message).toBe("Added README");
  });

  // TEST UNIQUE SHA CONSTRAINT
  it("should not allow duplicate SHA", async () => {
    await expect(
      prisma.commit.create({
        data: {
          message: "Duplicate SHA commit",
          sha: "sha123", // duplicate
          repoId,
        },
      })
    ).rejects.toThrow(); // P2002 Unique constraint
  });

  // DELETE COMMIT
  it("should delete commits", async () => {
    await prisma.commit.delete({ where: { id: commitId1 } });
    await prisma.commit.delete({ where: { id: commitId2 } });

    const commits = await prisma.commit.findMany({ where: { repoId } });
    expect(commits.length).toBe(0);
  });
});
