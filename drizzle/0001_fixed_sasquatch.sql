PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_commits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sha` text NOT NULL,
	`message` text NOT NULL,
	`author` text,
	`repoId` integer NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`repoId`) REFERENCES `repos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_commits`("id", "sha", "message", "author", "repoId", "createdAt") SELECT "id", "sha", "message", "author", "repoId", "createdAt" FROM `commits`;--> statement-breakpoint
DROP TABLE `commits`;--> statement-breakpoint
ALTER TABLE `__new_commits` RENAME TO `commits`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `commits_sha_unique` ON `commits` (`sha`);--> statement-breakpoint
CREATE TABLE `__new_invites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`teamId` integer NOT NULL,
	`invitedBy` integer NOT NULL,
	`invitedUser` text NOT NULL,
	`status` text DEFAULT 'PENDING',
	`expiresAt` text,
	`acceptedAt` text,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`invitedBy`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_invites`("id", "code", "teamId", "invitedBy", "invitedUser", "status", "expiresAt", "acceptedAt", "createdAt") SELECT "id", "code", "teamId", "invitedBy", "invitedUser", "status", "expiresAt", "acceptedAt", "createdAt" FROM `invites`;--> statement-breakpoint
DROP TABLE `invites`;--> statement-breakpoint
ALTER TABLE `__new_invites` RENAME TO `invites`;--> statement-breakpoint
CREATE UNIQUE INDEX `invites_code_unique` ON `invites` (`code`);--> statement-breakpoint
CREATE TABLE `__new_repos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`teamId` integer NOT NULL,
	`githubId` text NOT NULL,
	`fullName` text NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_repos`("id", "name", "teamId", "githubId", "fullName", "createdAt") SELECT "id", "name", "teamId", "githubId", "fullName", "createdAt" FROM `repos`;--> statement-breakpoint
DROP TABLE `repos`;--> statement-breakpoint
ALTER TABLE `__new_repos` RENAME TO `repos`;--> statement-breakpoint
CREATE TABLE `__new_teamMembers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`teamId` integer NOT NULL,
	`joinedAt` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_teamMembers`("id", "userId", "teamId", "joinedAt") SELECT "id", "userId", "teamId", "joinedAt" FROM `teamMembers`;--> statement-breakpoint
DROP TABLE `teamMembers`;--> statement-breakpoint
ALTER TABLE `__new_teamMembers` RENAME TO `teamMembers`;--> statement-breakpoint
CREATE UNIQUE INDEX `user_team_unique` ON `teamMembers` (`userId`,`teamId`);--> statement-breakpoint
CREATE TABLE `__new_teams` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
INSERT INTO `__new_teams`("id", "name", "createdAt") SELECT "id", "name", "createdAt" FROM `teams`;--> statement-breakpoint
DROP TABLE `teams`;--> statement-breakpoint
ALTER TABLE `__new_teams` RENAME TO `teams`;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`githubId` text NOT NULL,
	`username` text NOT NULL,
	`email` text,
	`activityStatus` text DEFAULT 'ACTIVE',
	`createdAt` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "githubId", "username", "email", "activityStatus", "createdAt") SELECT "id", "githubId", "username", "email", "activityStatus", "createdAt" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_githubId_unique` ON `users` (`githubId`);