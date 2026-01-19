import { readConfig } from '../config/auth.config';

export function getCurrentUser() {
  const config = readConfig();

  if (!config?.user?.id) {
    throw new Error('❌ Not logged in. Run `teams login` first.');
  }

  return config.user;
}
