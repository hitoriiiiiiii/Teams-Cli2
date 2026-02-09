import {
  sqliteTable,
  integer,
  text,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';

import { sql } from 'drizzle-orm';

// Enums
export const activityStatusEnum = ['ACTIVE', 'INACTIVE'] as const;
export const inviteStatusEnum = [
  'PENDING',
  'ACCEPTED',
  'REJECTED',
  'EXPIRED',
] as const;

// USERS TABLE
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  githubId: text('githubId').notNull().unique(),
  username: text('username').notNull(),
  email: text('email'),

  activityStatus: text('activityStatus')
    .$type<(typeof activityStatusEnum)[number]>()
    .default('ACTIVE'),

  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`),
});

// TEAMS TABLE
export const teams = sqliteTable('teams', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  name: text('name').notNull(),

  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`),
});

// TEAM MEMBERS TABLE
export const teamMembers = sqliteTable(
  'teamMembers',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),

    userId: integer('userId')
      .notNull()
      .references(() => users.id),

    teamId: integer('teamId')
      .notNull()
      .references(() => teams.id),

    joinedAt: text('joinedAt').default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userTeamUnique: uniqueIndex('user_team_unique').on(
      table.userId,
      table.teamId,
    ),
  }),
);

// REPOS TABLE
export const repos = sqliteTable('repos', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  name: text('name').notNull(),

  teamId: integer('teamId')
    .notNull()
    .references(() => teams.id),

  githubId: text('githubId').notNull(),
  fullName: text('fullName').notNull(),

  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`),
});

// COMMITS TABLE
export const commits = sqliteTable('commits', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  sha: text('sha').notNull().unique(),
  message: text('message').notNull(),

  author: text('author'),

  repoId: integer('repoId')
    .notNull()
    .references(() => repos.id),

  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`),
});

// INVITES TABLE
export const invites = sqliteTable('invites', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  code: text('code').notNull().unique(),

  teamId: integer('teamId')
    .notNull()
    .references(() => teams.id),

  invitedBy: integer('invitedBy')
    .notNull()
    .references(() => users.id),

  invitedUser: text('invitedUser').notNull(),

  status: text('status')
    .$type<(typeof inviteStatusEnum)[number]>()
    .default('PENDING'),

  expiresAt: text('expiresAt'),
  acceptedAt: text('acceptedAt'),

  createdAt: text('createdAt').default(sql`CURRENT_TIMESTAMP`),
});
