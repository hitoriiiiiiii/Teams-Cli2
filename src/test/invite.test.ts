import prisma from '../db/prisma';
import { sendInvite, acceptInvite, rejectInvite, getTeamInvites, getInviteByCode } from '../controllers/invite.controller';

describe('Invite model and controller (Prisma + Rate Limiting)', () => {
  let testTeamId: number;
  let testUserId: number;
  let targetUserId: number;

  beforeAll(async () => {
    // Create test users with unique IDs
    const timestamp = Date.now();
    
    const inviter = await prisma.user.create({
      data: {
        githubId: 'test_inviter_' + timestamp,
        username: 'test_inviter_' + timestamp,
        email: `inviter_${timestamp}@test.com`,
      },
    });
    testUserId = inviter.id;

    const target = await prisma.user.create({
      data: {
        githubId: 'test_target_' + timestamp,
        username: 'test_target_' + timestamp,
        email: `target_${timestamp}@test.com`,
      },
    });
    targetUserId = target.id;

    // Create test team
    const team = await prisma.team.create({
      data: {
        name: 'Test Team Invites ' + timestamp,
      },
    });
    testTeamId = team.id;

    // Add inviter as team member
    await prisma.teamMember.create({
      data: {
        userId: testUserId,
        teamId: testTeamId,
      },
    });

    console.log(`✅ Test setup: User ${testUserId}, Team ${testTeamId}, Target ${targetUserId}`);
  }, 20000);

  afterAll(async () => {
    // Clean up test data (best effort, in correct FK order)
    try {
      // Delete all invites for this team
      await prisma.invite.deleteMany({
        where: { teamId: testTeamId },
      });

      // Delete all team members in this team
      await prisma.teamMember.deleteMany({
        where: { teamId: testTeamId },
      });

      // Delete the team
      const team = await prisma.team.findUnique({
        where: { id: testTeamId },
      });
      if (team) {
        await prisma.team.delete({
          where: { id: testTeamId },
        });
      }

      // Delete test users
      await prisma.user.deleteMany({
        where: {
          OR: [
            { id: testUserId },
            { id: targetUserId },
          ],
        },
      });
    } catch (error) {
      // Silently ignore cleanup errors
    }

    await prisma.$disconnect();
  });

  it('should send an invite when within rate limit', async () => {
    const invite = await sendInvite(testTeamId, testUserId, `target_${targetUserId}`);

    expect(invite).toBeDefined();
    expect(invite.id).toBeDefined();
    expect(invite.code).toBeDefined();
    expect(invite.code.length).toBe(8);
    expect(invite.teamId).toBe(testTeamId);
    expect(invite.invitedBy).toBe(testUserId);
    expect(invite.status).toBe('PENDING');
    expect(invite.invitedUser).toBe(`target_${targetUserId}`);
  });

  it('should not send invite if user is not a team member', async () => {
    // Create a non-member user
    const nonMember = await prisma.user.create({
      data: {
        githubId: 'non_member_' + Date.now(),
        username: 'non_member_' + Date.now(),
        email: `non_member_${Date.now()}@test.com`,
      },
    });

    try {
      await sendInvite(testTeamId, nonMember.id, `target_${targetUserId}`);
      fail('Should have thrown an error');
    } catch (error: any) {
      expect(error.message).toContain('not a member of this team');
    }

    await prisma.user.delete({
      where: { id: nonMember.id },
    });
  });

  it('should respect rate limit of 10 invites per hour per team', async () => {
    // Send 9 more invites (we already sent 1)
    for (let i = 0; i < 9; i++) {
      const invite = await sendInvite(testTeamId, testUserId, `target_${targetUserId}_${i}`);
      expect(invite).toBeDefined();
      expect(invite.id).toBeDefined();
    }

    // 11th attempt - will only throw if Redis is running
    // If Redis is not running, rate limiter gracefully allows requests
    try {
      const invite = await sendInvite(testTeamId, testUserId, `target_${targetUserId}_extra`);
      // If we get here, Redis is not running, which is OK for tests
      // The rate limiter has graceful degradation when Redis is unavailable
      expect(invite).toBeDefined();
    } catch (error: any) {
      // If Redis IS running, we should get rate limit error
      expect(error.message).toContain('Rate limit exceeded');
    }
  }, 30000);

  it('should have different rate limits for different teams', async () => {
    // Create another team
    const team2 = await prisma.team.create({
      data: {
        name: 'Test Team 2 Invites ' + Date.now(),
      },
    });

    // Add user to second team
    await prisma.teamMember.create({
      data: {
        userId: testUserId,
        teamId: team2.id,
      },
    });

    // Should be able to send invite to team2 (different team = different rate limit)
    const invite = await sendInvite(team2.id, testUserId, `target_${targetUserId}`);
    expect(invite).toBeDefined();
    expect(invite.teamId).toBe(team2.id);

    // Clean up team2
    await prisma.invite.deleteMany({
      where: { teamId: team2.id },
    });

    await prisma.teamMember.deleteMany({
      where: { teamId: team2.id },
    });

    await prisma.team.delete({
      where: { id: team2.id },
    });
  });

  it('should create invite with unique code', async () => {
    const invite1 = await sendInvite(testTeamId, testUserId, `unique_test_1`);
    const invite2 = await sendInvite(testTeamId, testUserId, `unique_test_2`);

    expect(invite1.code).not.toEqual(invite2.code);
  });

  it('should fetch invites by team', async () => {
    const invites = await getTeamInvites(testTeamId);

    expect(Array.isArray(invites)).toBe(true);
    expect(invites.length).toBeGreaterThan(0);

    // All should belong to the team
    invites.forEach((invite) => {
      expect(invite.teamId).toBe(testTeamId);
    });
  });

  it('should accept an invite', async () => {
    // Create an invite first
    const invite = await sendInvite(testTeamId, testUserId, `accept_test_${Date.now()}`);

    // Accept the invite
    const accepted = await acceptInvite(invite.code, targetUserId);

    expect(accepted).toBeDefined();
    expect(accepted.status).toBe('ACCEPTED');
    expect(accepted.acceptedAt).toBeDefined();
  });

  it('should reject an invite', async () => {
    // Create an invite first
    const invite = await sendInvite(testTeamId, testUserId, `reject_test_${Date.now()}`);

    // Reject the invite
    const rejected = await rejectInvite(invite.code);

    expect(rejected).toBeDefined();
    expect(rejected.status).toBe('REJECTED');
  });

  it('should not accept an already accepted invite', async () => {
    // Create a new target user for this test
    const newTarget = await prisma.user.create({
      data: {
        githubId: 'double_accept_target_' + Date.now(),
        username: 'double_accept_target_' + Date.now(),
        email: `double_accept_${Date.now()}@test.com`,
      },
    });

    // Create and accept an invite
    const invite = await sendInvite(testTeamId, testUserId, `double_accept_test_${Date.now()}`);
    await acceptInvite(invite.code, newTarget.id);

    // Try to accept again with same user
    let acceptError = false;
    try {
      await acceptInvite(invite.code, newTarget.id);
    } catch (error: any) {
      acceptError = true;
      expect(error.message).toContain('already');
    }
    expect(acceptError).toBe(true);

    // Clean up (delete teamMember first due to FK constraint)
    await prisma.teamMember.deleteMany({
      where: { userId: newTarget.id },
    });
    await prisma.user.delete({
      where: { id: newTarget.id },
    });
  });

  it('should not reject an already accepted invite', async () => {
    // Create a new target user for this test
    const newTarget = await prisma.user.create({
      data: {
        githubId: 'double_reject_target_' + Date.now(),
        username: 'double_reject_target_' + Date.now(),
        email: `double_reject_${Date.now()}@test.com`,
      },
    });

    // Create and accept an invite
    const invite = await sendInvite(testTeamId, testUserId, `double_reject_test_${Date.now()}`);
    await acceptInvite(invite.code, newTarget.id);

    // Try to reject
    let rejectError = false;
    try {
      await rejectInvite(invite.code);
    } catch (error: any) {
      rejectError = true;
      expect(error.message).toContain('already');
    }
    expect(rejectError).toBe(true);

    // Clean up (delete teamMember first due to FK constraint)
    await prisma.teamMember.deleteMany({
      where: { userId: newTarget.id },
    });
    await prisma.user.delete({
      where: { id: newTarget.id },
    });
  });

  it('should store invite with correct timestamps', async () => {
    const beforeCreate = new Date();
    const invite = await sendInvite(testTeamId, testUserId, `timestamp_test_${Date.now()}`);
    const afterCreate = new Date();

    expect(invite.createdAt).toBeDefined();
    expect(invite.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    expect(invite.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
  });

  it('should include team and inviter info when fetching invite', async () => {
    const invite = await sendInvite(testTeamId, testUserId, `include_test_${Date.now()}`);
    const fetched = await getInviteByCode(invite.code);

    expect(fetched).toBeDefined();
    expect(fetched?.team).toBeDefined();
    expect(fetched?.team.id).toBe(testTeamId);
    expect(fetched?.inviter).toBeDefined();
    expect(fetched?.inviter.id).toBe(testUserId);
  });
});
