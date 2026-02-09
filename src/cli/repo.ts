import ora from 'ora';
import chalk from 'chalk';
import { askRepoDetails, confirmAction } from '../utils/inquirer.js';
import {
  connectRepo,
  disconnectRepo,
  listRepos,
} from '../services/github.services.js';
import { requireLogin } from './team.js';

/**
 * Connect a GitHub repository
 */
export async function connectRepoCommand() {
  requireLogin();

  const spinner = ora('Preparing to connect repository...').start();

  try {
    spinner.stop();

    const { owner, repo, isPrivate } = await askRepoDetails();

    const connectSpinner = ora(`Connecting ${owner}/${repo}...`).start();

    await connectRepo({ owner, repo, isPrivate });

    connectSpinner.succeed(
      chalk.green(`Repository ${owner}/${repo} connected successfully`),
    );
  } catch (err: any) {
    spinner.fail('Failed to connect repository');
    console.error(chalk.red(err.message));
  }
}

/**
 * Disconnect a repository
 */
export async function disconnectRepoCommand() {
  requireLogin();

  const repos = await listRepos();

  if (repos.length === 0) {
    console.log(chalk.yellow('No repositories connected'));
    return;
  }

  const { repo } = await askRepoDetails();

  const confirm = await confirmAction(
    `Are you sure you want to disconnect ${repo}?`,
  );

  if (!confirm) {
    console.log(chalk.gray('Operation cancelled'));
    return;
  }

  const spinner = ora('Disconnecting repository...').start();

  await disconnectRepo(repo);

  spinner.succeed(chalk.red(`Repository ${repo} disconnected`));
}

/**
 * List connected repositories
 */
export async function listRepoCommand() {
  requireLogin();

  const spinner = ora('Fetching repositories...').start();

  const repos = await listRepos();

  spinner.stop();

  if (repos.length === 0) {
    console.log(chalk.yellow('No repositories connected'));
    return;
  }

  repos.forEach((r: any, i: number) => {
    console.log(`${i + 1}. ${chalk.cyan(r.owner + '/' + r.repo)}`);
  });
}
