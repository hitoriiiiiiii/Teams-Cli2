import { getCurrentUser } from '../utils/currentUser.js';
import { isUserMemberOfTeam } from '../db/repositories/index.js';

export async function ensureUserInTeam(userId: number, teamId: number) {
  const isMember = await isUserMemberOfTeam(userId, teamId);
  if (!isMember) {
    throw new Error('❌ You are not a member of this team.');
  }
}

export function requireLogin() {
  return getCurrentUser();
}
