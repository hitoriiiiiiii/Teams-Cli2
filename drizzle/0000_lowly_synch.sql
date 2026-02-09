CREATE TABLE `commits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`sha` text NOT NULL,
	`message` text NOT NULL,
	`author` text,
	`repoId` integer NOT NULL,
	`createdAt` text DEFAULT '2026-02-05T20:56:00.300Z',
	FOREIGN KEY (`repoId`) REFERENCES `repos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `commits_sha_unique` ON `commits` (`sha`);--> statement-breakpoint
CREATE TABLE `invites` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`teamId` integer NOT NULL,
	`invitedBy` integer NOT NULL,
	`invitedUser` text NOT NULL,
	`status` text DEFAULT 'PENDING',
	`expiresAt` text,
	`acceptedAt` text,
	`createdAt` text DEFAULT '2026-02-05T20:56:00.300Z',
	FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`invitedBy`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invites_code_unique` ON `invites` (`code`);--> statement-breakpoint
CREATE TABLE `repos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`teamId` integer NOT NULL,
	`githubId` text NOT NULL,
	`fullName` text NOT NULL,
	`createdAt` text DEFAULT '2026-02-05T20:56:00.300Z',
	FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `teamMembers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`userId` integer NOT NULL,
	`teamId` integer NOT NULL,
	`joinedAt` text DEFAULT '2026-02-05T20:56:00.299Z',
	FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_team_unique` ON `teamMembers` (`userId`,`teamId`);--> statement-breakpoint
CREATE TABLE `teams` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`createdAt` text DEFAULT '2026-02-05T20:56:00.299Z'
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`githubId` text NOT NULL,
	`username` text NOT NULL,
	`email` text,
	`activityStatus` text DEFAULT 'ACTIVE',
	`createdAt` text DEFAULT '2026-02-05T20:56:00.296Z'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_githubId_unique` ON `users` (`githubId`);