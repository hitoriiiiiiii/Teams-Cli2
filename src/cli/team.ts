import prisma from '../db/prisma';
import { getCurrentUser } from '../utils/currentUser';

export async function ensureUserInTeam(userId: number, teamId: number) {
  const member = await prisma.teamMember.findFirst({
    where: { userId, teamId },
  });

  if (!member) {
    throw new Error('❌ You are not a member of this team.');
  }
}

export function requireLogin() {
  return getCurrentUser();
}
