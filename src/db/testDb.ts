import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

import * as schema from './schema';

/**
 * Creates a fresh in-memory SQLite database for Jest tests.
 * Tables are created automatically.
 */
export function createTestDb() {
  const sqlite = new Database(':memory:');

  // Enable foreign key support
  sqlite.exec(`PRAGMA foreign_keys = ON;`);

  // Create tables manually
  sqlite.exec(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      githubId TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL,
      email TEXT,
      activityStatus TEXT DEFAULT 'ACTIVE',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE teamMembers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      teamId INTEGER NOT NULL,
      joinedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(userId) REFERENCES users(id),
      FOREIGN KEY(teamId) REFERENCES teams(id)
    );

    CREATE UNIQUE INDEX user_team_unique
    ON teamMembers(userId, teamId);

    CREATE TABLE repos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      teamId INTEGER NOT NULL,
      githubId TEXT NOT NULL,
      fullName TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(teamId) REFERENCES teams(id)
    );

    CREATE TABLE commits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sha TEXT NOT NULL UNIQUE,
      message TEXT NOT NULL,
      author TEXT,
      repoId INTEGER NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(repoId) REFERENCES repos(id)
    );

    CREATE TABLE invites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      teamId INTEGER NOT NULL,
      invitedBy INTEGER NOT NULL,
      invitedUser TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING',
      expiresAt TEXT,
      acceptedAt TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(teamId) REFERENCES teams(id),
      FOREIGN KEY(invitedBy) REFERENCES users(id)
    );
  `);

  const db = drizzle(sqlite, { schema });

  return db;
}
