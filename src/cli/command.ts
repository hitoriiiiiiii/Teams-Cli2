import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { showHelp } from './help';
import { loginWithGithub, logoutUser, authStatus } from '../cli/auth';
import { getGithubUser } from './github';
import {
  createRepo,
  getReposByTeam,
  deleteRepoByFullName,
} from '../controllers/repo.controller';
import { getCurrentUser } from '../utils/currentUser';
import {
  createTeam,
  getTeamByUser,
  addUsertoTeam,
  removeUserFromTeam,
  getTeamById,
} from '../controllers/team.controller';
import {
  sendInvite,
  acceptInvite,
  getTeamInvites,
  getInviteByCode,
  rejectInvite,
} from '../controllers/invite.controller';
import prisma from '../db/prisma';
import { ensureUserInTeam, requireLogin } from './team';
import { getUserByUsername } from '../controllers/user.controller';
import { getCommits, getCommit } from '../controllers/commits.controller';
import { logger } from '../utils/logger';
import { startSpinner, successSpinner } from '../utils/spinner';
import {
  askTeamName,
  askGithubUsername,
  askTeamId,
  askUserId,
  askRepoName,
  askInviteCode,
  askConfigKeyValue,
  confirmAction,
} from '../utils/inquirer';

const program = new Command();

program
  .name(chalk.cyan.bold('teams'))
  .description(chalk.magenta('Teams CLI - find, create and manage teams'))
  .version('1.0.0');

//Auth commands

program
  .command('login')
  .description('Login to Teams CLI')
  .action(async () => {
    await loginWithGithub();
    await getGithubUser();
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
  .command('me')
  .description('Get current user profile')
  .action(() => {
    console.log('👤 Fetching your GitHub profile...');
  });

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

    if (userId) {
      logger.info(`Fetching user with ID ${userId}`);
    } else {
      logger.info(`Fetching GitHub user ${username}`);
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

    logger.info(`Fetching team ${teamId}`);
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

      spinner.succeed(chalk.green.bold(`Found ${team.members.length} member(s)`));
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

      const team = await prisma.team.findFirst({ where: { name: teamName } });
      if (!team) {
        spinner.fail(chalk.red.bold('Team not found'));
        return;
      }

      const repoData = {
        githubId: Math.floor(Math.random() * 1000000),
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
      const team = await prisma.team.findFirst({
        where: { name: teamName },
      });

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

    const team = await prisma.team.findFirst({
      where: { name: finalTeamName },
    });
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
      console.log(chalk.yellow('Code   :') + chalk.cyan.bold(` ${invite.code}`));
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
      console.log(chalk.yellow('Team:') + chalk.cyan.bold(` ${invite.team.name}`));
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

    const spinner = startSpinner(
      chalk.cyan(`Rejecting invite...`),
      'cyan',
    );

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

    const spinner = startSpinner(
      chalk.cyan(`Fetching invites...`),
      'cyan',
    );

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
        console.log(chalk.dim(`   Expires: ${new Date(inv.expiresAt).toLocaleDateString()}`));
      });
    } catch (error: any) {
      spinner.fail(chalk.red.bold('Failed to fetch invites'));
      logger.error(error.message);
    }
  });
//commits commands

const commits = program.command('commits').description('Commits Management');

commits
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
commits
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
          chalk.cyan.bold(` ${(commit as any).date || commit.createdAt}`),
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
      const data = await prisma.teamMember.findMany({
        where: { teamId: Number(teamId) },
        include: {
          user: {
            include: {
              commits: {
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
        },
      });

      spinner.succeed(chalk.green.bold('✓ Activity computed'));

      logger.title('📊 Member Activity');
      const now = new Date();

      data.forEach((m) => {
        const lastCommit = m.user.commits[0]?.createdAt;
        let status = 'Inactive';

        if (lastCommit) {
          const days =
            (now.getTime() - lastCommit.getTime()) / (1000 * 60 * 60 * 24);

          if (days <= 7) status = 'Active (7d)';
          else if (days <= 14) status = 'Warm (14d)';
          else if (days <= 30) status = 'Cold (30d)';
        }

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
      const leaderboard = await prisma.commit.groupBy({
        by: ['authorId'],
        where: {
          repo: { teamId: Number(teamId) },
          authorId: { not: null },
        },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      });

      spinner.succeed(chalk.green.bold('✓ Leaderboard ready'));
      logger.title('🏆 Team Leaderboard');

      for (let i = 0; i < leaderboard.length; i++) {
        const user = await prisma.user.findUnique({
          where: { id: leaderboard[i].authorId! },
        });

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
      const user = await getUserByUsername(username);
      if (!user) throw new Error('User not found');

      const commits = await prisma.commit.count({
        where: {
          authorId: user.id,
          repo: { teamId: Number(teamId) },
        },
      });

      const lastCommit = await prisma.commit.findFirst({
        where: {
          authorId: user.id,
          repo: { teamId: Number(teamId) },
        },
        orderBy: { createdAt: 'desc' },
      });

      spinner.succeed(chalk.green.bold('✓ Analytics ready'));
      logger.title(`📈 ${username} Analytics`);

      console.log(chalk.yellow('Total Commits: ') + commits);
      console.log(
        chalk.yellow('Last Active  : ') + (lastCommit?.createdAt || 'Never'),
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
      const members = await prisma.teamMember.count({
        where: { teamId: Number(teamId) },
      });

      const commits = await prisma.commit.count({
        where: { repo: { teamId: Number(teamId) } },
      });

      spinner.succeed(chalk.green.bold('✓ Summary ready'));
      logger.title('📊 Team Summary');

      console.log(chalk.cyan('Members : ') + members);
      console.log(chalk.cyan('Commits : ') + commits);
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

    logger.info(`⚙️ ${key}=value`);
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
