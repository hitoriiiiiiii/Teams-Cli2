import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

import {
  createInvite as createInviteRepo,
  getInviteByCode as getInviteByCodeRepo,
  getInviteWithDetails as getInviteWithDetailsRepo,
  getPendingInvitesForTeam as getPendingInvitesForTeamRepo,
  updateInviteStatus as updateInviteStatusRepo,
} from '../db/repositories/invite.repository';
import { addUserToTeam } from '../db/repositories/team.repository';
import { getInviteRateLimitRemaining } from '../api/rateLimiter';

function normalizeCode(codeParam: string | string[] | undefined): string {
  if (!codeParam) return '';
  return Array.isArray(codeParam) ? codeParam[0] : codeParam;
}

// HTTP handlers (Express)
export async function sendInviteHandler(req: Request, res: Response) {
  try {
    const { teamId, invitedUser } = req.body;
    const inviterId = (req as any).user?.id;

    if (!inviterId) return res.status(401).json({ error: 'Unauthorized' });

    const remaining = await getInviteRateLimitRemaining(inviterId, teamId);
    if (remaining <= 0) return res.status(429).json({ error: 'Invite rate limit exceeded' });

    const code = uuidv4();
    const invite = await createInviteRepo({ code, teamId, invitedBy: inviterId, invitedUser });

    return res.json({ success: true, invite: { code: invite.code } });
  } catch (e) {
    console.error('sendInvite error', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}

export async function acceptInviteHandler(req: Request, res: Response) {
  try {
    const code = normalizeCode(req.params.code);
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const invite = await getInviteByCodeRepo(code);
    if (!invite) return res.status(404).json({ error: 'Invite not found' });
    if (invite.status !== 'PENDING') return res.status(400).json({ error: 'Invite not pending' });

    await addUserToTeam(userId, invite.teamId);
    await updateInviteStatusRepo(code, 'ACCEPTED', new Date().toISOString());

    return res.json({ success: true });
  } catch (e) {
    console.error('acceptInvite error', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}

export async function getInviteHandler(req: Request, res: Response) {
  try {
    const code = normalizeCode(req.params.code);
    const invite = await getInviteByCodeRepo(code);
    if (!invite) return res.status(404).json({ error: 'Invite not found' });
    return res.json({ invite });
  } catch (e) {
    console.error('getInvite error', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}

export async function rejectInviteHandler(req: Request, res: Response) {
  try {
    const code = normalizeCode(req.params.code);
    const userId = (req as any).user?.id;

    const invite = await getInviteByCodeRepo(code);
    if (!invite) return res.status(404).json({ error: 'Invite not found' });
    if (invite.invitedBy !== userId) return res.status(403).json({ error: 'Forbidden' });

    await updateInviteStatusRepo(code, 'REJECTED');
    return res.json({ success: true });
  } catch (e) {
    console.error('rejectInvite error', e);
    return res.status(500).json({ error: 'Internal error' });
  }
}

// Programmatic API used by CLI
export async function sendInvite(teamId: number, inviterId: number, invitedUser: string) {
  const remaining = await getInviteRateLimitRemaining(inviterId, teamId);
  if (remaining <= 0) throw new Error('Invite rate limit exceeded');
  const code = uuidv4();
  return createInviteRepo({ code, teamId, invitedBy: inviterId, invitedUser });
}

export async function acceptInvite(code: string, userId: number) {
  const invite = await getInviteWithDetailsRepo(code);
  if (!invite) throw new Error('Invite not found');
  if (invite.invite.status !== 'PENDING') throw new Error('Invite not pending');

  await addUserToTeam(userId, invite.invite.teamId);
  await updateInviteStatusRepo(code, 'ACCEPTED', new Date().toISOString());

  return getInviteWithDetailsRepo(code);
}

export async function getTeamInvites(teamId: number, status?: string) {
  // Repository currently only supports pending invites; ignore status parameter
  return getPendingInvitesForTeamRepo(teamId);
}

export async function getInviteByCode(code: string) {
  return getInviteByCodeRepo(code);
}

export async function rejectInvite(code: string) {
  const invite = await getInviteByCodeRepo(code);
  if (!invite) throw new Error('Invalid invite code');
  if (!invite.status) throw new Error('Invalid invite status');
  if (invite.status !== 'PENDING') throw new Error(`Invite is already ${String(invite.status).toLowerCase()}`);
  return updateInviteStatusRepo(code, 'REJECTED');
}
