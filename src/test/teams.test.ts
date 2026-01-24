import prisma from '../db/prisma';

describe('Teams Module (Prisma Integration Tests)', () => {
  let userId: number;
  let teamId: number;

  beforeAll(async () => {
    // Clean DB in FK-safe order (NO try/catch)
    await prisma.commit.deleteMany();
    await prisma.repo.deleteMany();
    await prisma.teamMember.deleteMany();
    await prisma.team.deleteMany();
    await prisma.user.deleteMany();

    // Create user
    const user = await prisma.user.create({
      data: {
        githubId: 'team_user_001',
        username: 'TEAM_USER',
        email: 'teamuser@test.com',
      },
    });

    userId = user.id;
  });

  // CREATE TEAM
  it('should create a team', async () => {
    const team = await prisma.team.create({
      data: { name: 'Core Team' },
    });

    teamId = team.id;

    expect(team).toBeDefined();
    expect(team.name).toBe('Core Team');
  });

  // ADD USER TO TEAM
  it('should add user to team', async () => {
    const member = await prisma.teamMember.create({
      data: { userId, teamId },
    });

    expect(member.userId).toBe(userId);
    expect(member.teamId).toBe(teamId);
  });

  // FETCH TEAM WITH MEMBERS
  it('should fetch team with members', async () => {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: { include: { user: true } },
      },
    });

    expect(team).not.toBeNull();
    expect(team?.members.length).toBe(1);
    expect(team?.members[0].user.username).toBe('TEAM_USER');
  });

  // FETCH USER TEAMS
  it('should fetch all teams of a user', async () => {
    const teams = await prisma.teamMember.findMany({
      where: { userId },
      include: { team: true },
    });

    expect(teams.length).toBe(1);
    expect(teams[0].team.name).toBe('Core Team');
  });

  // REMOVE USER FROM TEAM
  it('should remove user from team', async () => {
    await prisma.teamMember.delete({
      where: {
        userId_teamId: { userId, teamId },
      },
    });

    const member = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: { userId, teamId },
      },
    });

    expect(member).toBeNull();
  });
});
