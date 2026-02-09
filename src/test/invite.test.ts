import { db } from './setup';
import { invites, teams, users } from '../db/schema';
import { eq } from 'drizzle-orm';

describe('Invite model (Drizzle)', () => {
  beforeAll(async () => {
    await db.delete(invites);
  });

  it('should create, fetch and update invite status', async () => {
    const u = await db.insert(users).values({ githubId: 'inviter', username: 'inviter' }).returning();
    const t = await db.insert(teams).values({ name: 'InviteTeam' }).returning();

    const invite = await db.insert(invites).values({
      code: 'ABC12345',
      teamId: t[0].id,
      invitedBy: u[0].id,
      invitedUser: 'target_user',
    }).returning();

    expect(invite.length).toBe(1);

    const fetched = await db.select().from(invites).where(eq(invites.code, 'ABC12345'));
    expect(fetched.length).toBe(1);
    expect(fetched[0].status).toBe('PENDING');

    const updated = await db.update(invites).set({ status: 'ACCEPTED' }).where(eq(invites.code, 'ABC12345')).returning();
    expect(updated[0].status).toBe('ACCEPTED');
  });
});