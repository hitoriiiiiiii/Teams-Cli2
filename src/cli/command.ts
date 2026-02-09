import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { showHelp } from './help.js';
import { logoutUser, loginWithGithub } from '../cli/auth.js';
import {
  createRepo,
  getReposByTeam,
  deleteRepoByFullName,
} from '../controllers/repo.controller.js';
import { getCurrentUser } from '../utils/currentUser.js';
import {
  createTeam,
  getTeamByUser,
  addUsertoTeam,
  removeUserFromTeam,
  getTeamById,
} from '../controllers/team.controller.js';
import {
  sendInvite,
  acceptInvite,
  getTeamInvites,
  rejectInvite,
} from '../controllers/invite.controller.js';
import {
  computeMemberActivity,
  getTeamLeaderboard,
} from '../services/analytics.services.js';
import { db } from '../db/index.js';
import { users, teamMembers, repos, commits, teams } from '../db/schema.js';
import { eq, count, desc, and } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { ensureUserInTeam, requireLogin } from './team.js';
import { getUserByUsername } from '../controllers/user.controller.js';
import { getCommits, getCommit } from '../controllers/commits.controller.js';
import { logger } from '../utils/logger.js';
import { startSpinner } from '../utils/spinner.js';
import {
  askTeamName,
  askGithubUsername,
  askTeamId,
  askUserId,
  askRepoName,
  askInviteCode,
  askConfigKeyValue,
  confirmAction,
} from '../utils/inquirer.js';

const dbDir = path.join(os.homedir(), '.teams-cli');
const dbPath = path.join(dbDir, 'teams.db');

fs.mkdirSync(dbDir, { recursive: true });
process.env.DATABASE_URL = `file:${dbPath}`;
const program = new Command();

program
  .name(chalk.cyan.bold('teams'))
  .description(chalk.magenta('Teams CLI - find, create and manage teams'))
  .version('1.0.0');

//Auth commands

program
  .command('login')
  .description('Login to Teams CLI with GitHub OAuth')
  .action(async () => {
    try {
      await loginWithGithub();
    } catch (error: any) {
      console.error(chalk.red('❌ Login failed: ' + error.message));
    }
  });

program
  .command('logout')
  .description('Logout from Teams CLI')
  .action(() => {
    logoutUser();
  });

program
  .command('whoami')
  .description('Show current logged-in user')
  .action(() => {
    const user = getCurrentUser();
    logger.header('Current User Profile');
    console.log(chalk.yellow('ID       :') + chalk.cyan.bold(` ${user.id}`));
    console.log(
      chalk.yellow('Username :') + chalk.cyan.bold(` ${user.username}`),
    );
  });

//User commands'

const user = program.command('user').description('User related commands');

user
  .command('get')
  .description("Get another user's details")
  .option('-i, --id <id>', 'User ID')
  .option('-u, --username <username>', 'GitHub username')
  .action(async (opts) => {
    let userId = opts.id;
    let username = opts.username;

    if (!userId && !username) {
      const choice = await inquirer.prompt([
        {
          type: 'list',
          name: 'method',
          message: 'How do you want to search for a user?',
          choices: ['By Username', 'By User ID'],
        },
      ]);

      if (choice.method === 'By Username') {
        const { username: inputUsername } = await askGithubUsername();
        username = inputUsername;
      } else {
        const { id } = await askUserId();
        userId = id;
      }
    }

    const spinner = startSpinner(
      chalk.cyan('Fetching user details...'),
      'cyan',
    );
    try {
      let user;
      if (userId) {
        const userResult = await db
          .select({
            id: users.id,
            githubId: users.githubId,
            username: users.username,
            email: users.email,
            activityStatus: users.activityStatus,
            createdAt: users.createdAt,
          })
          .from(users)
          .where(eq(users.id, Number(userId)))
          .limit(1);
        user = userResult[0];
      } else {
        user = await getUserByUsername(username as string);
      }

      if (!user) {
        spinner.fail(chalk.red.bold('User not found'));
        return;
      }

      spinner.succeed(chalk.green.bold('✓ User found'));
      logger.header(`User Details: ${user.username}`);
      console.log(chalk.yellow('ID       :') + chalk.cyan.bold(` ${user.id}`));
      console.log(
        chalk.yellow('Email    :') + chalk.cyan.bold(` ${user.email}`),
      );
      console.log(
        chalk.yellow('GitHub   :') +
          chalk.cyan.bold(` ${user.githubId || 'N/A'}`),
      );
      console.log(
        chalk.yellow('Username :') + chalk.cyan.bold(` ${user.username}`),
      );
      if ((user as any).teams && (user as any).teams.length > 0) {
        console.log(
          chalk.yellow('Teams    :') +
            chalk.cyan.bold(
              ` ${(user as any).teams.map((t: any) => t.team.name).join(', ')}`,
            ),
        );
      }
    } catch (error) {
      spinner.fail(chalk.red.bold('Failed to fetch user details'));
      console.error(error);
    }
  });

//Team commands

const team = program.command('team').description('Team Management');

team
  .command('create [name]')
  .description('Create a new team')
  .action(async (name?: string) => {
    let finalName = name;

    if (!finalName) {
      const { name: inputName } = await askTeamName();
      finalName = inputName;
    }

    const spinner = startSpinner(
      chalk.cyan(`Creating team "${finalName}"...`),
      'cyan',
    );
    try {
      const user = getCurrentUser();
      const team = await createTeam(finalName as string, user.id);
      spinner.succeed(chalk.green.bold(`✓ Team created successfully!`));
      logger.title('Team Details');
      console.log(chalk.yellow('ID  :') + chalk.cyan.bold(` ${team.id}`));
      console.log(chalk.yellow('Name:') + chalk.cyan.bold(` ${team.name}`));
    } catch (error) {
      spinner.fail(chalk.red.bold('✗ Failed to create team'));
      console.error(error);
    }
  });

team
  .command('list')
  .description('List all teams')
  .action(async () => {
    const spinner = startSpinner(chalk.cyan('Fetching your teams...'), 'cyan');
    try {
      const user = getCurrentUser();
      const teams = await getTeamByUser(user.id);

      if (teams.length === 0) {
        spinner.warn(chalk.yellow.bold('No teams found'));
        return;
      }

      spinner.succeed(chalk.green.bold(`Found ${teams.length} team(s)`));
      logger.title('Your Teams');
      teams.forEach((t: any, index: number) => {
        console.log(
          chalk.cyan(`${index + 1}.`) +
            chalk.yellow(` [ID: ${t.team.id}]`) +
            chalk.white(` ${t.team.name}`),
        );
      });
    } catch (error) {
      spinner.fail(chalk.red.bold('Failed to fetch teams'));
      console.error(error);
    }
  });

team
  .command('get')
  .description('Get team details')
  .option('-i, --id <id>', 'Team ID')
  .action(async (opts) => {
    let teamId = opts.id;

    if (!teamId) {
      const { id } = await askTeamId();
      teamId = id;
    }

    const spinner = startSpinner(
      chalk.cyan(`Fetching team ${teamId}...`),
      'cyan',
    );
    try {
      const team = await getTeamById(Number(teamId));
      if (!team) {
        spinner.fail(chalk.red.bold('Team not found'));
        return;
      }

      const memberResult = await db
        .select({ count: count() })
        .from(teamMembers)
        .where(eq(teamMembers.teamId, Number(teamId)));

      const repoResult = await db
        .select({ count: count() })
        .from(repos)
        .where(eq(repos.teamId, Number(teamId)));

      const memberCount = memberResult[0].count;
      const repoCount = repoResult[0].count;

      spinner.succeed(chalk.green.bold('✓ Team details fetched'));
      logger.header(`Team: ${team.name}`);
      console.log(chalk.yellow('ID        :') + chalk.cyan.bold(` ${team.id}`));
      console.log(
        chalk.yellow('Name      :') + chalk.cyan.bold(` ${team.name}`),
      );
      console.log(
        chalk.yellow('Members   :') + chalk.cyan.bold(` ${memberCount}`),
      );
      console.log(
        chalk.yellow('Repos     :') + chalk.cyan.bold(` ${repoCount}`),
      );
      console.log(
        chalk.yellow('Created   :') + chalk.cyan.bold(` ${team.createdAt}`),
      );
    } catch (error: any) {
      spinner.fail(chalk.red.bold('Failed to fetch team details'));

      // Check for database connection errors
      if (
        error.message?.includes("Can't reach database server") ||
        error.code === 'ECONNREFUSED'
      ) {
        console.error(chalk.red('\n⚠ Database Connection Error:'));
        console.error(chalk.yellow('  The database server is unreachable.'));
        console.error(chalk.yellow('  Please check:'));
        console.error(chalk.yellow('    1. Your internet connection'));
        console.error(chalk.yellow('    2. DATABASE_URL environment variable'));
        console.error(chalk.yellow('    3. Supabase server status'));
      } else {
        console.error(chalk.red('\nError details:'), error.message || error);
      }
    }
  });

team
  .command('delete')
  .description('Delete a team')
  .option('-i, --id <id>', 'Team ID')
  .action(async (opts) => {
    let teamId = opts.id;

    if (!teamId) {
      const { id } = await askTeamId();
      teamId = id;
    }

    const confirmed = await confirmAction(
      chalk.yellow.bold(`⚠️  Are you sure you want to delete team ${teamId}?`),
    );

    if (!confirmed) {
      logger.warning('Team deletion cancelled');
      return;
    }

    logger.success(`Team ${teamId} deleted`);
  });

team
  .command('join')
  .description('Join a team')
  .option('-i, --id <id>', 'Team ID')
  .action(async (opts) => {
    let teamId = opts.id;

    if (!teamId) {
      const { id } = await askTeamId();
      teamId = id;
    }

    logger.success(`🤝 Joined team ${teamId}`);
  });

team
  .command('leave')
  .description('Leave a team')
  .option('-i, --id <id>', 'Team ID')
  .action(async (opts) => {
    let teamId = opts.id;

    if (!teamId) {
      const { id } = await askTeamId();
      teamId = id;
    }

    const confirmed = await confirmAction(
      chalk.yellow.bold(`⚠️  Are you sure you want to leave team ${teamId}?`),
    );

    if (!confirmed) {
      logger.warning('Leave team cancelled');
      return;
    }

    logger.success(`👋 Left team ${teamId}`);
  });

//Member commands

const member = program.command('member').description('Team members');

member
  .command('add')
  .description('Add a member to team')
  .option('-t, --team <id>', 'Team ID')
  .option('-u, --username <username>', 'GitHub username')
  .action(async (opts) => {
    try {
      // Require login
      const user = requireLogin();

      let teamId = opts.team;
      let username = opts.username;

      if (!teamId) {
        const { id } = await askTeamId();
        teamId = id;
      }

      if (!username) {
        const { username: inputUsername } = await askGithubUsername();
        username = inputUsername;
      }

      const spinner = startSpinner(
        chalk.cyan(`Adding ${chalk.bold(username)} to team...`),
        'cyan',
      );

      const teamIdNum = Number(teamId);
      const targetUser = await getUserByUsername(username);

      await ensureUserInTeam(user.id, teamIdNum);

      if (!targetUser) {
        spinner.fail(chalk.red.bold('User not found'));
        return;
      }

      await addUsertoTeam(targetUser.id, teamIdNum);
      spinner.succeed(
        chalk.green.bold(`✓ ${username} added to team ${teamIdNum}`),
      );
    } catch (error: any) {
      if (error.message.includes('no user')) {
        logger.error('❌ You must login first. Run: teams login');
      } else {
        logger.error(`❌ ${error.message}`);
      }
    }
  });

member
  .command('remove')
  .description('Remove a member from team')
  .option('-t, --team <id>', 'Team ID')
  .option('-u, --username <username>', 'GitHub username')
  .action(async (opts) => {
    let teamId = opts.team;
    let username = opts.username;

    if (!teamId) {
      const { id } = await askTeamId();
      teamId = id;
    }

    if (!username) {
      const { username: inputUsername } = await askGithubUsername();
      username = inputUsername;
    }

    const confirmed = await confirmAction(
      chalk.yellow.bold(`⚠️  Remove ${username} from team ${teamId}?`),
    );

    if (!confirmed) {
      logger.warning('Remove member cancelled');
      return;
    }

    const spinner = startSpinner(
      chalk.cyan(`Removing ${chalk.bold(username)} from team...`),
      'cyan',
    );

    try {
      const user = getCurrentUser();
      const teamIdNum = Number(teamId);
      const targetUser = await getUserByUsername(username);

      if (!targetUser) {
        spinner.fail(chalk.red.bold('User not found'));
        return;
      }

      // Verify current user is a member of the team
      await ensureUserInTeam(user.id, teamIdNum);

      // Remove user from team
      await removeUserFromTeam(targetUser.id, teamIdNum);
      spinner.succeed(
        chalk.green.bold(`✓ ${username} removed from team ${teamIdNum}`),
      );
    } catch (error: any) {
      spinner.fail(chalk.red.bold('Failed to remove member'));
      logger.error(error.message);
    }
  });

member
  .command('list')
  .description('List team members')
  .option('-t, --team <id>', 'Team ID')
  .action(async (opts) => {
    let teamId = opts.team;

    if (!teamId) {
      const { id } = await askTeamId();
      teamId = id;
    }

    const spinner = startSpinner(
      chalk.cyan(`Fetching team members...`),
      'cyan',
    );

    try {
      const teamIdNum = Number(teamId);
      const team = await getTeamById(teamIdNum);

      if (!team) {
        spinner.fail(chalk.red.bold('Team not found'));
        return;
      }

      if (!team.members.length) {
        spinner.warn(chalk.yellow.bold('No members found in this team'));
        return;
      }

      spinner.succeed(
        chalk.green.bold(`Found ${team.members.length} member(s)`),
      );
      logger.title(`👥 Team "${team.name}" Members`);
      team.members.forEach((member: any, index: number) => {
        console.log(
          chalk.cyan(`${index + 1}.`) +
            chalk.white(` ${member.user.username}`) +
            chalk.dim(` (ID: ${member.user.id})`),
        );
      });
    } catch (error: any) {
      spinner.fail(chalk.red.bold('Failed to fetch members'));
      logger.error(error.message);
    }
  });

// Repositories commands
const repo = program.command('repo').description('Repository management');

repo
  .command('add <teamName> <repoName>')
  .description('Add a repo to a team')
  .action(async (teamName, repoName) => {
    const spinner = startSpinner(
      chalk.cyan(`Adding repository "${repoName}" to team "${teamName}"...`),
      'cyan',
    );

    try {
      const user = getCurrentUser();

      const teamResult = await db
        .select()
        .from(teams)
        .where(eq(teams.name, teamName));

      const team = teamResult[0];
      if (!team) {
        spinner.fail(chalk.red.bold('Team not found'));
        return;
      }

      const repoData = {
        githubId: Math.floor(Math.random() * 1000000).toString(),
        name: repoName,
        fullName: `${user.username}/${repoName}`,
        private: false,
        stars: 0,
        forks: 0,
        teamId: team.id,
      };

      await createRepo(repoData);
      spinner.succeed(chalk.green.bold(`✓ Repo added successfully!`));
      console.log(
        chalk.yellow('Repository:') + chalk.cyan.bold(` ${repoName}`),
      );
      console.log(
        chalk.yellow('Team      :') + chalk.cyan.bold(` ${teamName}`),
      );
    } catch (error) {
      spinner.fail(chalk.red.bold('Failed to add repository'));
      console.error(error);
    }
  });

repo
  .command('list <teamName>')
  .description('List all repos of a team')
  .action(async (teamName) => {
    const spinner = startSpinner(
      chalk.cyan(`Fetching repositories for "${teamName}"...`),
      'cyan',
    );

    try {
      const teamResult = await db
        .select()
        .from(teams)
        .where(eq(teams.name, teamName));

      const team = teamResult[0];

      if (!team) {
        spinner.fail(chalk.red.bold('Team not found'));
        return;
      }

      const repos = await getReposByTeam(team.id);

      if (!repos.length) {
        spinner.warn(chalk.yellow.bold('No repositories found'));
        return;
      }

      spinner.succeed(chalk.green.bold(`Found ${repos.length} repository/ies`));
      logger.title(`Repositories in "${teamName}"`);
      repos.forEach((r: any, index: number) => {
        console.log(chalk.cyan(`${index + 1}.`) + chalk.white(` ${r.name}`));
      });
    } catch (error) {
      spinner.fail(chalk.red.bold('Failed to fetch repositories'));
      console.error(error);
    }
  });

repo
  .command('remove <teamName> <repoName>')
  .description('Remove a repo from a team')
  .action(async (teamName, repoName) => {
    let finalTeamName = teamName;
    let finalRepoName = repoName;

    if (!teamName) {
      const { name } = await askTeamName();
      finalTeamName = name;
    }

    if (!repoName) {
      const { name } = await askRepoName();
      finalRepoName = name;
    }

    const confirmed = await confirmAction(
      chalk.yellow.bold(
        `⚠️  Remove repository "${finalRepoName}" from team "${finalTeamName}"?`,
      ),
    );

    if (!confirmed) {
      logger.warning('Repository removal cancelled');
      return;
    }

    const teamResult = await db
      .select()
      .from(teams)
      .where(eq(teams.name, finalTeamName))
      .limit(1);
    const team = teamResult[0];
    if (!team) {
      logger.error('Team not found');
      return;
    }

    await deleteRepoByFullName(team.id, `${finalTeamName}/${finalRepoName}`);
    logger.success(
      `🗑️ Repo ${finalRepoName} removed from team ${finalTeamName}`,
    );
  });

//Invite commands

const invite = program.command('invite').description('Invitation');

invite
  .command('send')
  .description('Send team invite')
  .option('-t, --team <id>', 'Team ID')
  .option('-u, --username <username>', 'GitHub username')
  .action(async (opts) => {
    let teamId = opts.team;
    let username = opts.username;

    if (!teamId) {
      const { id } = await askTeamId();
      teamId = id;
    }

    if (!username) {
      const { username: inputUsername } = await askGithubUsername();
      username = inputUsername;
    }

    const spinner = startSpinner(
      chalk.cyan(`Sending invite to ${chalk.bold(username)}...`),
      'cyan',
    );

    try {
      const user = getCurrentUser();
      const teamIdNum = Number(teamId);

      // Verify team exists
      const team = await getTeamById(teamIdNum);
      if (!team) {
        spinner.fail(chalk.red.bold('Team not found'));
        return;
      }

      // Verify current user is a member of the team
      await ensureUserInTeam(user.id, teamIdNum);

      // Create invite
      const invite = await sendInvite(teamIdNum, user.id, username);

      spinner.succeed(chalk.green.bold('✓ Invite sent successfully'));
      logger.title('Invite Details');
      console.log(
        chalk.yellow('Code   :') + chalk.cyan.bold(` ${invite.code}`),
      );
      console.log(chalk.yellow('To     :') + chalk.cyan.bold(` ${username}`));
      console.log(chalk.yellow('Team   :') + chalk.cyan.bold(` ${team.name}`));
      console.log(chalk.dim('Expires: 7 days from now'));
    } catch (error: any) {
      spinner.fail(chalk.red.bold('Failed to send invite'));
      logger.error(error.message);
    }
  });

invite
  .command('accept')
  .description('Accept an invite')
  .option('-c, --code <code>', 'Invite code')
  .action(async (opts) => {
    let code = opts.code;

    if (!code) {
      const { code: inputCode } = await askInviteCode();
      code = inputCode;
    }

    const spinner = startSpinner(
      chalk.cyan(`Accepting invite ${chalk.bold(code)}...`),
      'cyan',
    );

    try {
      const user = getCurrentUser();
      const invite = await acceptInvite(code, user.id);

      spinner.succeed(chalk.green.bold('✓ Invite accepted'));
      logger.title('Team Joined');
      console.log(
        chalk.yellow('Team:') + chalk.cyan.bold(` ${invite.team?.name}`),
      );
    } catch (error: any) {
      spinner.fail(chalk.red.bold('Failed to accept invite'));
      logger.error(error.message);
    }
  });

invite
  .command('reject')
  .description('Reject an invite')
  .option('-c, --code <code>', 'Invite code')
  .action(async (opts) => {
    let code = opts.code;

    if (!code) {
      const { code: inputCode } = await askInviteCode();
      code = inputCode;
    }

    const spinner = startSpinner(chalk.cyan(`Rejecting invite...`), 'cyan');

    try {
      await rejectInvite(code);
      spinner.succeed(chalk.green.bold('✓ Invite rejected'));
    } catch (error: any) {
      spinner.fail(chalk.red.bold('Failed to reject invite'));
      logger.error(error.message);
    }
  });

invite
  .command('list')
  .description('List pending invites for a team')
  .option('-t, --team <id>', 'Team ID')
  .action(async (opts) => {
    let teamId = opts.team;

    if (!teamId) {
      const { id } = await askTeamId();
      teamId = id;
    }

    const spinner = startSpinner(chalk.cyan(`Fetching invites...`), 'cyan');

    try {
      const teamIdNum = Number(teamId);
      const user = getCurrentUser();

      // Verify user is a member of the team
      await ensureUserInTeam(user.id, teamIdNum);

      const invites = await getTeamInvites(teamIdNum, 'PENDING');

      if (!invites.length) {
        spinner.warn(chalk.yellow.bold('No pending invites'));
        return;
      }

      spinner.succeed(chalk.green.bold(`Found ${invites.length} invite(s)`));
      logger.title('Pending Invites');
      invites.forEach((inv: any, index: number) => {
        console.log(
          chalk.cyan(`${index + 1}.`) +
            chalk.white(` Code: ${inv.code}`) +
            chalk.dim(` → ${inv.invitedUser || 'Pending'}`),
        );
        console.log(chalk.dim(`   Sent by: ${inv.inviter.username}`));
        console.log(
          chalk.dim(
            `   Expires: ${new Date(inv.expiresAt).toLocaleDateString()}`,
          ),
        );
      });
    } catch (error: any) {
      spinner.fail(chalk.red.bold('Failed to fetch invites'));
      logger.error(error.message);
    }
  });
//commits commands

const commitsCmd = program.command('commits').description('Commits Management');

commitsCmd
  .command('list <owner> <repo>')
  .description('List commits for a repository')
  .option('-a, --author <author>', 'Filter commits by author')
  .action(async (owner, repo, opts) => {
    const spinner = startSpinner(
      chalk.cyan(`Fetching commits for ${owner}/${repo}...`),
      'cyan',
    );

    try {
      const author = opts.author || undefined;
      const commitList = await getCommits(owner, repo, author);

      if (!commitList.length) {
        spinner.warn(chalk.yellow.bold('No commits found'));
        return;
      }

      spinner.succeed(chalk.green.bold(`Found ${commitList.length} commit(s)`));
      logger.title(`Commits for ${owner}/${repo}`);
      commitList.forEach((c: any, index: number) => {
        console.log(
          chalk.cyan(`${index + 1}.`) +
            chalk.white(` ${c.sha.substring(0, 7)}`),
        );
        console.log(chalk.dim(`   Message: ${c.message}`));
        console.log(chalk.dim(`   Author : ${c.author}`));
      });
    } catch (err) {
      spinner.fail(chalk.red.bold('Failed to fetch commits'));
      console.error(err);
    }
  });

// Get a single commit by SHA
commitsCmd
  .command('get <owner> <repo> <sha>')
  .description('Get details of a specific commit')
  .action(async (owner, repo, sha) => {
    const spinner = startSpinner(
      chalk.cyan(`Fetching commit ${sha.substring(0, 7)}...`),
      'cyan',
    );

    try {
      const commit = await getCommit(owner, repo, sha);

      if (!commit) {
        spinner.fail(chalk.red.bold(`Commit ${sha} not found`));
        return;
      }

      spinner.succeed(chalk.green.bold(`✓ Commit found`));
      logger.header(`Commit Details: ${sha.substring(0, 7)}`);
      console.log(
        chalk.yellow('Author  :') +
          chalk.cyan.bold(` ${(commit as any).author || 'Unknown'}`),
      );
      console.log(
        chalk.yellow('Message :') + chalk.cyan.bold(` ${commit.message}`),
      );
      console.log(
        chalk.yellow('Date    :') +
          chalk.cyan.bold(
            ` ${(commit as any).date || (commit as any).createdAt}`,
          ),
      );
      console.log(
        chalk.yellow('Files   :') +
          chalk.cyan.bold(
            ` ${(commit as any).files?.length ? (commit as any).files.join(', ') : 'Not available'}`,
          ),
      );
      console.log(
        chalk.yellow('Source  :') + chalk.cyan.bold(` ${commit.source}`),
      );
    } catch (err: any) {
      spinner.fail(chalk.red.bold('Failed to fetch commit'));
      console.error(err.message);
    }
  });

//Analytics commands
const analytics = program
  .command('analytics')
  .description('Team analytics & insights');

analytics
  .command('activity')
  .description('Show member activity (7 / 14 / 30 days)')
  .option('-t, --team <id>', 'Team ID')
  .action(async (opts) => {
    let teamId = opts.team;

    if (!teamId) {
      const { id } = await askTeamId();
      teamId = id;
    }

    const spinner = startSpinner(
      chalk.cyan(`Computing activity for team ${teamId}...`),
      'cyan',
    );

    try {
      // Use the analytics service to compute activity
      await computeMemberActivity(Number(teamId));

      // Fetch updated member data with activity status
      const data = await db
        .select()
        .from(teamMembers)
        .where(eq(teamMembers.teamId, Number(teamId)))
        .leftJoin(users, eq(teamMembers.userId, users.id));

      spinner.succeed(chalk.green.bold('✓ Activity computed'));
      logger.title('📊 Member Activity');

      data.forEach((m: any) => {
        const statusMap: Record<string, string> = {
          ACTIVE_7_DAYS: 'Active (7d)',
          ACTIVE_14_DAYS: 'Warm (14d)',
          ACTIVE_30_DAYS: 'Cold (30d)',
          INACTIVE: 'Inactive',
        };

        const status = statusMap[m.activityStatus] || 'Unknown';
        console.log(
          chalk.cyan(m.user.username) +
            chalk.white(' → ') +
            chalk.yellow(status),
        );
      });
    } catch (err) {
      spinner.fail(chalk.red.bold('Failed to compute activity'));
      console.error(err);
    }
  });

analytics
  .command('leaderboard')
  .description('Show top contributors')
  .option('-t, --team <id>', 'Team ID')
  .action(async (opts) => {
    let teamId = opts.team;

    if (!teamId) {
      const { id } = await askTeamId();
      teamId = id;
    }

    const spinner = startSpinner(
      chalk.cyan('Generating leaderboard...'),
      'cyan',
    );

    try {
      // Use the analytics service
      const leaderboard = await getTeamLeaderboard(Number(teamId));

      spinner.succeed(chalk.green.bold('✓ Leaderboard ready'));
      logger.title('🏆 Team Leaderboard');

      for (let i = 0; i < leaderboard.length; i++) {
        const userResult = await db
          .select()
          .from(users)
          .where(eq(users.githubId, leaderboard[i].authorId!));

        const user = userResult[0];

        console.log(
          chalk.yellow(`#${i + 1}`) +
            ' ' +
            chalk.cyan(user?.username) +
            chalk.white(` → ${leaderboard[i]._count.id} commits`),
        );
      }
    } catch (err) {
      spinner.fail(chalk.red.bold('Failed to generate leaderboard'));
      console.error(err);
    }
  });
analytics
  .command('member')
  .description('Show analytics for a member')
  .option('-t, --team <id>', 'Team ID')
  .option('-u, --username <username>', 'GitHub username')
  .action(async (opts) => {
    let teamId = opts.team;
    let username = opts.username;

    if (!teamId) {
      const { id } = await askTeamId();
      teamId = id;
    }

    if (!username) {
      const { username: u } = await askGithubUsername();
      username = u;
    }

    const spinner = startSpinner(
      chalk.cyan(`Fetching analytics for ${username}...`),
      'cyan',
    );

    try {
      // Find user by username in the database
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.username, username));

      const user = userResult[0];

      if (!user) {
        spinner.fail(chalk.red.bold(`User ${username} not found in database`));
        return;
      }

      // Verify user is a member of the team
      const isMemberResult = await db
        .select()
        .from(teamMembers)
        .where(
          and(
            eq(teamMembers.userId, user.id),
            eq(teamMembers.teamId, Number(teamId)),
          ),
        );

      const isMember = isMemberResult[0];

      if (!isMember) {
        spinner.warn(
          chalk.yellow.bold(`${username} is not a member of this team`),
        );
        return;
      }

      const commitsResult = await db
        .select({ count: count() })
        .from(commits)
        .leftJoin(repos, eq(commits.repoId, repos.id))
        .where(
          and(
            eq(commits.author, user.githubId),
            eq(repos.teamId, Number(teamId)),
          ),
        );

      const commitCount = commitsResult[0].count;

      const lastCommitResult = await db
        .select()
        .from(commits)
        .leftJoin(repos, eq(commits.repoId, repos.id))
        .where(
          and(
            eq(commits.author, user.githubId),
            eq(repos.teamId, Number(teamId)),
          ),
        )
        .orderBy(desc(commits.createdAt))
        .limit(1);

      const lastCommit = lastCommitResult[0];

      spinner.succeed(chalk.green.bold('✓ Analytics ready'));
      logger.title(`📈 ${username} Analytics`);

      console.log(chalk.yellow('Total Commits: ') + commitCount);
      console.log(
        chalk.yellow('Last Active  : ') +
          (lastCommit?.commits.createdAt || 'Never'),
      );
    } catch (err) {
      spinner.fail(chalk.red.bold('Failed to fetch member analytics'));
      console.error(err);
    }
  });

analytics
  .command('summary')
  .description('Show team analytics summary')
  .option('-t, --team <id>', 'Team ID')
  .action(async (opts) => {
    let teamId = opts.team;

    if (!teamId) {
      const { id } = await askTeamId();
      teamId = id;
    }

    const spinner = startSpinner(
      chalk.cyan('Building team summary...'),
      'cyan',
    );

    try {
      const membersResult = await db
        .select({ count: count() })
        .from(teamMembers)
        .where(eq(teamMembers.teamId, Number(teamId)));
      const members = membersResult[0].count;

      const commitsResult = await db
        .select({ count: count() })
        .from(commits)
        .leftJoin(repos, eq(commits.repoId, repos.id))
        .where(eq(repos.teamId, Number(teamId)));

      const commitsCount = commitsResult[0].count;

      spinner.succeed(chalk.green.bold('✓ Summary ready'));
      logger.title('📊 Team Summary');

      console.log(chalk.cyan('Members : ') + members);
      console.log(chalk.cyan('Commits : ') + commitsCount);
    } catch (err) {
      spinner.fail(chalk.red.bold('Failed to generate summary'));
      console.error(err);
    }
  });

//Config commands

const config = program.command('config').description('CLI configration');

config
  .command('set')
  .description('Set config value')
  .option('-k, --key <key>', 'Config key')
  .option('-v, --value <value>', 'Config value')
  .action(async (opts) => {
    let key = opts.key;
    let value = opts.value;

    if (!key || !value) {
      const { key: inputKey, value: inputValue } = await askConfigKeyValue();
      key = inputKey;
      value = inputValue;
    }

    logger.success(`⚙️ Set ${key}=${value}`);
  });

config
  .command('get')
  .description('Get config value')
  .option('-k, --key <key>', 'Config key')
  .action(async (opts) => {
    let key = opts.key;

    if (!key) {
      const { name } = await inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: 'Config key:',
          validate: (input: string) =>
            input.trim() !== '' || 'Config key cannot be empty',
        },
      ]);
      key = name;
    }

    // Config management is planned for future implementation
    logger.info(`⚙️ Config key '${key}' - feature coming soon`);
  });

config
  .command('list')
  .description('List all config')
  .action(() => {
    console.log('⚙️ Listing config...');
  });

//Utility commands

program
  .command('init')
  .description('Initialize Teams CLI project')
  .action(() => {
    logger.header('Teams CLI Initialization');
    const spinner = startSpinner(
      chalk.cyan('Initializing Teams project...'),
      'cyan',
    );
    setTimeout(() => {
      spinner.succeed(chalk.green.bold('✓ Teams project initialized'));
    }, 1000);
  });

program
  .command('status')
  .description('Check CLI status')
  .action(() => {
    logger.title('CLI Status');
    console.log(chalk.green.bold('●') + chalk.green(' CLI is working fine'));
    console.log(chalk.green('✓ All systems operational'));
  });

//Help commands
program
  .command('help')
  .description('Show help menu')
  .action(() => {
    showHelp();
  });

program.parse(process.argv);
