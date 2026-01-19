import { Command } from 'commander';
import { showHelp } from './help';
import { loginWithGithub, logoutUser, authStatus } from '../cli/auth';
import { getGithubUser } from './github';
import {
  connectRepoCommand,
  disconnectRepoCommand,
  listRepoCommand,
} from './repo';
import { getCurrentUser } from '../utils/currentUser';
import { createTeam, getTeamByUser } from '../controllers/team.controller';
import { addUsertoTeam } from '../controllers/team.controller';
import prisma from '../db/prisma';
import { ensureUserInTeam } from './team';
import { getUserByUsername } from '../controllers/user.controller';

const program = new Command();

program
  .name('teams')
  .description('Teams CLI - find, create and manage teams')
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
    console.log('👤 Logged in as');
    console.log(`ID       : ${user.id}`);
    console.log(`Username : ${user.username}`);
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
  .action((opts) => {
    if (!opts.id && !opts.username) {
      console.error('❌ Provide --id or --username');
      process.exit(1);
    }

    if (opts.id) {
      console.log(`Fetching user with ID ${opts.id}`);
    } else {
      console.log(`Fetching Github user ${opts.username}`);
    }
  });

//Team commands

const team = program.command('team').description('Team Management');

team
  .command('create')
  .description('Create a new team')
  .option('-n, --name <name>', 'Team name')
  .action(async (opts) => {
    if (!opts.name) {
      console.error('❌ Team name is required');
      process.exit(1);
    }
    const user = getCurrentUser();
    const team = await createTeam(opts.name, user.id);

    console.log('✅ Team created');
    console.log(`ID : ${team.id}`);
    console.log(`Name: ${team.name}`);
  });

team
  .command('list')
  .description('List all teams')
  .action(async () => {
    const user = getCurrentUser();
    const teams = await getTeamByUser(user.id);

    if (teams.length === 0) {
      console.log('No teams found');
      return;
    }

    console.log('Your Teams:');
    teams.forEach((t) => {
      console.log(`ID: ${t.team.id} | Name: ${t.team.name}`);
    });
  });

team
  .command('get')
  .description('Get team details')
  .option('-i, --id <id>', 'Team ID')
  .action((opts) => {
    if (!opts.id) {
      console.error('❌ Team ID required');
      process.exit(1);
    }
    console.log(`Fetching team ${opts.id}`);
  });

team
  .command('delete')
  .description('Delete a team')
  .option('-i, --id <id>', 'Team ID')
  .action((opts) => {
    if (!opts.id) {
      console.error('❌ Team ID required');
      process.exit(1);
    }
    console.log(`🗑️ Team ${opts.id} deleted`);
  });

team
  .command('join')
  .description('Join a team')
  .option('-i, --id <id>', 'Team ID')
  .action((opts) => {
    console.log(`🤝 Joined team ${opts.id}`);
  });

team
  .command('leave')
  .description('Leave a team')
  .option('-i, --id <id>', 'Team ID')
  .action((opts) => {
    if (!opts.id) {
      console.error('❌ Team ID required');
      process.exit(1);
    }
    console.log(`👋 Left team ${opts.id}`);
  });

//Member commands

const member = program.command('member').description('Team members');

member
  .command('add')
  .description('Add a member to team')
  .option('-t, --team <id>', 'Team ID')
  .option('-u, --username <username>', 'GitHub username')
  .action(async (opts) => {
    if (!opts.team || !opts.username) {
      console.error('❌ teamId and username required');
      process.exit(1);
    }

    const user = getCurrentUser();
    const teamId = Number(opts.team);
    const targetUser = await getUserByUsername(opts.username);

    await ensureUserInTeam(user.id, teamId);

    if (!targetUser) {
      console.error('❌ User not found');
      return;
    }

    await addUsertoTeam(targetUser.id, teamId);

    console.log(`✅ ${opts.username} added to team ${teamId}`);
  });

member
  .command('remove')
  .description('Remove a member from team')
  .option('-t, --team <id>', 'Team ID')
  .option('-u, --username <username>', 'GitHub username')
  .action((opts) => {
    console.log(`➖ Removed ${opts.username} from team ${opts.team}`);
  });

member
  .command('list')
  .description('List team members')
  .option('-t, --team <id>', 'Team ID')
  .action((opts) => {
    console.log(`👥 Listing members of team ${opts.team}`);
  });

// Repositories commands
const repo = program.command('repo').description('Repository management');

repo
  .command('connect')
  .description('Connect a GitHub repository')
  .action(connectRepoCommand);

repo
  .command('disconnect')
  .description('Disconnect a GitHub repository')
  .action(disconnectRepoCommand);

repo
  .command('list')
  .description('List connected repositories')
  .action(listRepoCommand);

//Invite commands

const invite = program.command('invite').description('Invitation');

invite
  .command('send')
  .description('Send team invite')
  .option('-t, --team <id>', 'Team ID')
  .option('-u, --username <username>', 'GitHub username')
  .action((opts) => {
    console.log(`📨 Invite sent to ${opts.username}`);
  });

invite
  .command('accept')
  .description('Accept an invite')
  .option('-c, --code <code>', 'Invite code')
  .action((opts) => {
    console.log(`✅ Invite ${opts.code} accepted`);
  });

invite
  .command('list')
  .description('List invites')
  .action(() => {
    console.log('📨 Listing invites...');
  });

//Config commands

const config = program.command('config').description('CLI configration');

config
  .command('set')
  .description('Set config value')
  .option('-k, --key <key>', 'Config key')
  .option('-v, --value <value>', 'Config value')
  .action((opts) => {
    console.log(`⚙️ Set ${opts.key}=${opts.value}`);
  });

config
  .command('get')
  .description('Get config value')
  .option('-k, --key <key>', 'Config key')
  .action((opts) => {
    console.log(`⚙️ ${opts.key}=value`);
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
    console.log('🚀 Teams project initialized');
  });

program
  .command('status')
  .description('Check CLI status')
  .action(() => {
    console.log('🟢 CLI is working fine');
  });

//Help commands
program
  .command('help')
  .description('Show help menu')
  .action(() => {
    showHelp();
  });

program.parse(process.argv);
