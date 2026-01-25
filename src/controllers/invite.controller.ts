import prisma from '../db/prisma';
import { v4 as uuidv4 } from 'uuid';

/**
 * Send an invite to a user to join a team
 */
export async function sendInvite(
  teamId: number,
  invitedBy: number,
  targetUsername: string,
) {
  // Verify the inviter is a member of the team
  const member = await prisma.teamMember.findFirst({
    where: { userId: invitedBy, teamId },
  });

  if (!member) {
    throw new Error('You are not a member of this team');
  }

  // Generate unique invite code
  const code = uuidv4().substring(0, 8).toUpperCase();

  // Create invite record
  const invite = await prisma.invite.create({
    data: {
      code,
      teamId,
      invitedBy,
      invitedUser: targetUsername,
      status: 'PENDING',
    },
    include: {
      team: true,
      inviter: true,
    },
  });

  return invite;
}

/**
 * Accept an invite and add user to team
 */
export async function acceptInvite(code: string, userId: number) {
  const invite = await prisma.invite.findUnique({
    where: { code },
    include: { team: true },
  });

  if (!invite) {
    throw new Error('Invalid invite code');
  }

  if (invite.status !== 'PENDING') {
    throw new Error(`Invite is already ${invite.status.toLowerCase()}`);
  }

  // Check if invite has expired
  if (new Date() > invite.expiresAt) {
    await prisma.invite.update({
      where: { id: invite.id },
      data: { status: 'EXPIRED' },
    });
    throw new Error('Invite has expired');
  }

  // Check if user is already a member
  const existingMember = await prisma.teamMember.findFirst({
    where: { userId, teamId: invite.teamId },
  });

  if (existingMember) {
    throw new Error('You are already a member of this team');
  }

  // Add user to team
  await prisma.teamMember.create({
    data: {
      userId,
      teamId: invite.teamId,
    },
  });

  // Update invite status
  const acceptedInvite = await prisma.invite.update({
    where: { id: invite.id },
    data: {
      status: 'ACCEPTED',
      acceptedAt: new Date(),
    },
    include: { team: true },
  });

  return acceptedInvite;
}

/**
 * List pending invites for a team
 */
export async function getTeamInvites(teamId: number, status?: string) {
  return prisma.invite.findMany({
    where: {
      teamId,
      status: status ? (status.toUpperCase() as any) : undefined,
    },
    include: {
      inviter: true,
      team: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Reject an invite
 */
export async function rejectInvite(code: string) {
  const invite = await prisma.invite.findUnique({
    where: { code },
  });

  if (!invite) {
    throw new Error('Invalid invite code');
  }

  if (invite.status !== 'PENDING') {
    throw new Error(`Invite is already ${invite.status.toLowerCase()}`);
  }

  return prisma.invite.update({
    where: { id: invite.id },
    data: { status: 'REJECTED' },
  });
}

/**
 * Get invite details by code
 */
export async function getInviteByCode(code: string) {
  return prisma.invite.findUnique({
    where: { code },
    include: {
      team: true,
      inviter: true,
    },
  });
}
