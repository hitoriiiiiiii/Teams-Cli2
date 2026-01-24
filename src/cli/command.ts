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
import { createTeam, getTeamByUser } from '../controllers/team.controller';
import { addUsertoTeam } from '../controllers/team.controller';
import prisma from '../db/prisma';
import { ensureUserInTeam } from './team';
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
  .command('create <name>')
  .description('Create a new team')
  .action(async (name: string) => {
    const spinner = startSpinner(
      chalk.cyan(`Creating team "${name}"...`),
      'cyan',
    );
    try {
      const user = getCurrentUser();
      const team = await createTeam(name, user.id);
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

    try {
      const user = getCurrentUser();
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
    } catch (error) {
      spinner.fail(chalk.red.bold('Failed to add member'));
      console.error(error);
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

    logger.success(`➖ Removed ${username} from team ${teamId}`);
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

    logger.title(`👥 Team ${teamId} Members`);
    console.log(chalk.cyan('Listing members...'));
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
        githubId: 0,
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

    logger.success(`📨 Invite sent to ${username}`);
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

    logger.success(`✅ Invite ${code} accepted`);
  });

invite
  .command('list')
  .description('List invites')
  .action(() => {
    console.log('📨 Listing invites...');
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
