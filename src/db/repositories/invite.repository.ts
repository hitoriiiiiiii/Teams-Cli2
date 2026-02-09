import { eq, and } from 'drizzle-orm';
import { db } from '../index.js';
import { invites, teams, users } from '../schema.js';

export type Invite = typeof invites.$inferSelect;

/**
 * Create an invite
 */
export async function createInvite(data: {
  code: string;
  teamId: number;
  invitedBy: number;
  invitedUser: string;
  expiresAt?: string;
}): Promise<Invite> {
  const result = await db
    .insert(invites)
    .values({
      ...data,
      status: 'PENDING',
    })
    .returning();
  return result[0];
}

/**
 * Get invite by code
 */
export async function getInviteByCode(code: string): Promise<Invite | null> {
  const result = await db
    .select()
    .from(invites)
    .where(eq(invites.code, code))
    .limit(1);
  return result[0] || null;
}

/**
 * Get invite with details (team, inviter)
 */
export async function getInviteWithDetails(code: string) {
  const result = await db
    .select({
      invite: invites,
      team: teams,
      inviter: users,
    })
    .from(invites)
    .where(eq(invites.code, code))
    .leftJoin(teams, eq(invites.teamId, teams.id))
    .leftJoin(users, eq(invites.invitedBy, users.id))
    .limit(1);
  return result[0] || null;
}

/**
 * Update invite status
 */
export async function updateInviteStatus(
  code: string,
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED',
  acceptedAt?: string,
): Promise<Invite | null> {
  const updates: any = { status };
  if (acceptedAt) {
    updates.acceptedAt = acceptedAt;
  }

  const result = await db
    .update(invites)
    .set(updates)
    .where(eq(invites.code, code))
    .returning();
  return result[0] || null;
}

/**
 * Get pending invites for a team
 */
export async function getPendingInvitesForTeam(
  teamId: number,
): Promise<Invite[]> {
  return db
    .select()
    .from(invites)
    .where(and(eq(invites.teamId, teamId), eq(invites.status, 'PENDING')));
}

/**
 * Get invites sent by a user
 */
export async function getInvitesSentByUser(
  userId: number,
  teamId: number,
): Promise<Invite[]> {
  return db
    .select()
    .from(invites)
    .where(and(eq(invites.invitedBy, userId), eq(invites.teamId, teamId)));
}

/**
 * Count pending invites sent in a time period for rate limiting
 */
export async function countRecentInvites(
  userId: number,
  teamId: number,
  _sinceTimestamp: string,
): Promise<number> {
  const result = await db
    .select()
    .from(invites)
    .where(
      and(
        eq(invites.invitedBy, userId),
        eq(invites.teamId, teamId),
        eq(invites.status, 'PENDING'),
      ),
    );
  return result.length;
}

/**
 * Delete invite by code
 */
export async function deleteInvite(code: string): Promise<Invite | null> {
  const result = await db
    .delete(invites)
    .where(eq(invites.code, code))
    .returning();
  return result[0] || null;
}

/**
 * Get all invites for a user (targeting them)
 */
export async function getInvitesForUser(
  username: string,
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED',
): Promise<Invite[]> {
  if (status) {
    return db
      .select()
      .from(invites)
      .where(
        and(eq(invites.invitedUser, username), eq(invites.status, status)),
      );
  }
  return db.select().from(invites).where(eq(invites.invitedUser, username));
}
