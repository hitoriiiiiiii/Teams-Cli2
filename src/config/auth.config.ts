import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.mycli');
const CONFIG_FILE = path.join(CONFIG_DIR, 'auth.json');

interface AuthData {
  token?: string;
  user?: {
    id: number;
    githubId: string;
    username: string;
    email: string | null;
  };
   activeTeamId?: number;
}

export function readConfig(): AuthData {
  if (!fs.existsSync(CONFIG_FILE)) return {};
  return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
}

export function writeConfig(data: Partial<AuthData>) {
  const current = readConfig();
  const updated = { ...current, ...data };
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
}

export function getAuthToken(): string | null {
  const data = readConfig();
  return data.token || null;
}

export function getUser() {
  const data = readConfig();
  return data.user || null;
}

export function clearAuthToken() {
  if (fs.existsSync(CONFIG_FILE)) fs.unlinkSync(CONFIG_FILE);
}
