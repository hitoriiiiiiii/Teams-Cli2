import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from '../db/schema';
import { setDb } from '../db/index';

// Setup in-memory SQLite database for tests
const DB_PATH = process.env.DATABASE_URL || ':memory:';
const sqlite = new Database(DB_PATH);
const testDb = drizzle(sqlite, { schema });

// Create tables (users, teams, teamMembers, invites, repos, commits)
const createTablesSQL = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    githubId TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL,
    email TEXT,
    activityStatus TEXT DEFAULT 'ACTIVE',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS teamMembers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    teamId INTEGER NOT NULL,
    joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE,
    UNIQUE(userId, teamId)
  );

  CREATE TABLE IF NOT EXISTS invites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    teamId INTEGER NOT NULL,
    invitedBy INTEGER NOT NULL,
    invitedUser TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    acceptedAt DATETIME,
    expiresAt DATETIME,
    FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (invitedBy) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS repos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    fullName TEXT NOT NULL UNIQUE,
    githubId INTEGER NOT NULL UNIQUE,
    teamId INTEGER NOT NULL,
    stars INTEGER DEFAULT 0,
    forks INTEGER DEFAULT 0,
    language TEXT,
    private BOOLEAN DEFAULT false,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS commits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL,
    sha TEXT NOT NULL UNIQUE,
    repoId INTEGER NOT NULL,
    author TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (repoId) REFERENCES repos(id) ON DELETE CASCADE
  );
`;

sqlite.exec(createTablesSQL);

// Inject the test DB into the application's db binding so imports use the same instance
setDb(testDb as any);

// Export the injected Drizzle instance for tests that import this file directly
export { testDb as db };

// Cleanup after each test
afterEach(async () => {
  // Clear all tables
  sqlite.exec(`
    DELETE FROM commits;
    DELETE FROM repos;
    DELETE FROM invites;
    DELETE FROM teamMembers;
    DELETE FROM teams;
    DELETE FROM users;
  `);
});

// Close database after all tests
afterAll(() => {
  sqlite.close();
});
