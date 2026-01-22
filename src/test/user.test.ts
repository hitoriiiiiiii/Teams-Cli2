import prisma from "../db/prisma";

describe("User model (Prisma)", () => {

  beforeAll(async () => {
    // ensure clean state
    await prisma.user.deleteMany({
      where: {
        email: "test@example.com"
      }
    });
  });

  afterAll(async () => {
    // cleanup after tests
    await prisma.user.deleteMany({
      where: {
        email: "test@example.com"
      }
    });

    await prisma.$disconnect();
  });

  it("should create a user", async () => {
    const user = await prisma.user.create({
      data: {
        githubId: "999999",
        username: "TEST_USER",
        email: "test@example.com",
      },
    });

    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.githubId).toBe("999999");
    expect(user.username).toBe("TEST_USER");
    expect(user.email).toBe("test@example.com");
  });

  it("should fetch user by username", async () => {
    const user = await prisma.user.findFirst({
  where: { username: "TEST_USER" },
});

    expect(user).not.toBeNull();
    expect(user?.username).toBe("TEST_USER");
  });

  it("should not allow duplicate email", async () => {
    try {
      await prisma.user.create({
        data: {
          githubId: "888888",
          username: "DUPLICATE",
          email: "test@example.com", // same email
        },
      });
    } catch (error: any) {
      expect(error.code).toBe("P2002"); // Prisma unique constraint
    }
  });

});
