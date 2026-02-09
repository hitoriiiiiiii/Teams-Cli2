import { db } from './setup';
import { users, teams, teamMembers } from '../db/schema';
import { eq } from 'drizzle-orm';

describe('Team model (Drizzle)', () => {
  beforeAll(async () => {
    // clean relevant tables
    await db.delete(teamMembers);
    await db.delete(teams);
    await db.delete(users);
  });

  it('should create a team and add owner as member', async () => {
    const createdUser = await db.insert(users).values({
      githubId: 'gh_owner',
      username: 'owner',
      email: 'owner@test.com',
    }).returning();

    expect(createdUser.length).toBe(1);
    const ownerId = createdUser[0].id;

    const createdTeam = await db.insert(teams).values({ name: 'TeamA' }).returning();
    expect(createdTeam.length).toBe(1);
    const teamId = createdTeam[0].id;

    const added = await db.insert(teamMembers).values({ userId: ownerId, teamId }).returning();
    expect(added.length).toBe(1);

    const members = await db.select().from(teamMembers).where(eq(teamMembers.teamId, teamId));
    expect(members.length).toBe(1);
    expect(members[0].userId).toBe(ownerId);
  });

  it('should prevent duplicate team membership', async () => {
    // Create fresh user and team for this test
    const cu = await db.insert(users).values({ githubId: 'dupe_user', username: 'dupe' }).returning();
    const ct = await db.insert(teams).values({ name: 'DupeTeam' }).returning();
    const userId = cu[0].id;
    const teamId = ct[0].id;

    await db.insert(teamMembers).values({ userId, teamId }).returning();

    let error = false;
    try {
      await db.insert(teamMembers).values({ userId, teamId }).returning();
    } catch (e) {
      error = true;
    }
    expect(error).toBe(true);
  });
});