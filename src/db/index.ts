import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

const DB_FILE = process.env.DATABASE_URL || 'teams.db';

// Parse database file path and ensure directory exists
const dbPath = DB_FILE.replace('file:', '');
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(dbPath);

// Export a mutable binding so tests can replace the DB instance.
export let db = drizzle(sqlite, { schema });

// Helper to inject a different Drizzle instance (used by tests)
export function setDb(newDb: typeof db) {
    // @ts-ignore
  db = newDb;
}
